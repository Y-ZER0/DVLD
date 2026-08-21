import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DashboardRecentApplicationDto,
  DashboardSummaryDto,
  DashboardUpcomingAppointmentDto,
} from '@repo/shared';
import { ApplicationStatus } from '@repo/shared';
import { Application } from '../local-license-applications/entities/application.entity';
import { TestAppointment } from '../testing/entities/test-appointment.entity';
import { License } from '../licenses/entities/license.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { DetainedLicense } from '../detain-release/entities/detained-license.entity';
import { ApplicationType as ApplicationTypeEntity } from '../lookup/entities/application-type.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const appRepo = this.dataSource.getRepository(Application);
    const testAppointmentRepo = this.dataSource.getRepository(TestAppointment);
    const licenseRepo = this.dataSource.getRepository(License);
    const driverRepo = this.dataSource.getRepository(Driver);
    const detainedRepo = this.dataSource.getRepository(DetainedLicense);

    const activeApplications = await appRepo.count({
      where: { applicationStatus: ApplicationStatus.NEW },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const testsToday = await testAppointmentRepo
      .createQueryBuilder('ta')
      .where('ta.AppointmentDate >= :start', { start: todayStart })
      .andWhere('ta.AppointmentDate <= :end', { end: todayEnd })
      .getCount();

    const pendingAppointments = await testAppointmentRepo.count({
      where: { isLocked: false },
    });

    const activeDrivers = await driverRepo.count();

    const activeLicenses = await licenseRepo.count({
      where: { isActive: true },
    });

    const detainedLicenses = await detainedRepo.count({
      where: { isReleased: false },
    });

    const recentRows = await appRepo.find({
      relations: { person: true },
      order: { applicationDate: 'DESC' },
      take: 3,
    });

    const applicationTypeRepo = this.dataSource.getRepository(ApplicationTypeEntity);
    const applicationTypes = await applicationTypeRepo.find();
    const typeMap = new Map(applicationTypes.map((t) => [t.id, t.applicationTypeTitle]));

    const recentApplications: DashboardRecentApplicationDto[] = recentRows.map((row) => ({
      applicationId: row.id,
      applicantName: `${row.person.firstName} ${row.person.lastName}`,
      nationalNumber: row.person.nationalNumber,
      applicationTypeTitle: typeMap.get(row.applicationTypeId)!,
      applicationStatus: row.applicationStatus,
      paidFees: row.paidFees,
      applicationDate: row.applicationDate.toISOString(),
    }));

    const upcomingRows = await testAppointmentRepo.find({
      where: { isLocked: false },
      relations: {
        testType: true,
        lla: { application: { person: true } },
      },
      order: { appointmentDate: 'ASC' },
      take: 5,
    });

    const upcomingTestAppointments: DashboardUpcomingAppointmentDto[] =
      upcomingRows.map((ta) => ({
        appointmentId: ta.id,
        applicantName: `${ta.lla.application.person.firstName} ${ta.lla.application.person.lastName}`,
        nationalNumber: ta.lla.application.person.nationalNumber,
        testTypeTitle: ta.testType.testTypeTitle,
        appointmentDate: ta.appointmentDate.toISOString(),
      }));

    return {
      activeApplications,
      testsToday,
      pendingAppointments,
      activeDrivers,
      activeLicenses,
      detainedLicenses,
      recentApplications,
      upcomingTestAppointments,
    };
  }
}
