import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import {
  ApplicationStatus,
  TestAppointmentDto,
  TestPipelineDto,
  TestStageDto,
  TestStageStatus,
} from '@repo/shared';
import { LocalLicenseApplicationsService } from '../local-license-applications/local-license-applications.service';
import { LookupService } from '../lookup/lookup.service';
import { TestAppointment } from './entities/test-appointment.entity';
import { Test } from './entities/test.entity';
import { TestAppointmentsRepository } from './repositories/test-appointments.repository';
import { ScheduleTestAppointmentRequestDto } from './dtos/schedule-test-appointment-request.dto';
import { RecordTestResultRequestDto } from './dtos/record-test-result-request.dto';

// TestingService — the test pipeline: three stages per application in seeded
// order, fee snapshot at schedule time, results recorded once and locked
// forever, failures forcing a fresh retake appointment.
@Injectable()
export class TestingService {
  constructor(
    private readonly appsRepo: TestAppointmentsRepository,
    private readonly appsService: LocalLicenseApplicationsService,
    private readonly lookupService: LookupService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined appointment into the shared flat DTO.
  private toDto(a: TestAppointment): TestAppointmentDto {
    return {
      id: a.id,
      testTypeId: a.testTypeId,
      testTypeTitle: a.testType.testTypeTitle,
      localDrivingLicenseApplicationId: a.llaId,
      appointmentDate: a.appointmentDate.toISOString(),
      paidFees: a.paidFees,
      isLocked: a.isLocked,
      test: a.test
        ? { id: a.test.id, result: a.test.testResult, notes: a.test.notes }
        : null,
    };
  }

  // Books a slot for one stage, enforcing the sequencing gates and
  // snapshotting the stage's fee from the lookup row.
  async schedule(
    llaId: number,
    dto: ScheduleTestAppointmentRequestDto,
    actingUserId: number,
  ): Promise<TestAppointmentDto> {
    // The application must exist (and must still be New).
    const application = await this.appsService.findOne(llaId);
    if (application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Cannot schedule tests for a ${application.applicationStatus} application`,
      );
    }

    // The stage must exist; its row is also the fee snapshot source.
    const testType = await this.lookupService.findTestTypeById(dto.testTypeId);
    if (!testType) {
      throw new NotFoundException('Test type not found');
    }

    // A stage may hold at most one open (unlocked) slot.
    const existing = await this.appsRepo.findUnlockedForStage(
      llaId,
      testType.id,
    );
    if (existing) {
      throw new ConflictException(
        `A ${testType.testTypeTitle} appointment is already scheduled for this application`,
      );
    }

    // Sequencing gates: a passed stage can never be booked again, and every
    // stage beyond the first requires its predecessor to be passed.
    const stageOrder = await this.lookupService.findAllTestTypes();
    const positionIndex = stageOrder.findIndex((t) => t.id === testType.id);
    if (positionIndex === -1) {
      throw new ConflictException(
        `Test type ${testType.testTypeTitle} is not part of the test sequence`,
      );
    }
    const history = await this.appsRepo.findAllForApplication(llaId);
    if (
      history.some(
        (a) => a.testTypeId === testType.id && a.test?.testResult === true,
      )
    ) {
      throw new ConflictException(
        `The ${testType.testTypeTitle} test has already been passed`,
      );
    }
    if (positionIndex > 0) {
      const predecessor = stageOrder[positionIndex - 1];
      if (!predecessor) {
        throw new ConflictException(
          `Test type ${testType.testTypeTitle} has no configured predecessor`,
        );
      }
      const predecessorPassed = history.some(
        (a) => a.testTypeId === predecessor.id && a.test?.testResult === true,
      );
      if (!predecessorPassed) {
        throw new ConflictException(
          `Cannot schedule ${testType.testTypeTitle} before ${predecessor.testTypeTitle} has been passed`,
        );
      }
    }

    // Insert the slot: fee snapshotted at booking time, unlocked, session user recorded.
    const saved = await this.appsRepo.save(
      this.appsRepo.create({
        testTypeId: testType.id,
        llaId,
        appointmentDate: new Date(dto.appointmentDate),
        paidFees: testType.testTypeFees,
        createdByUserId: actingUserId,
        isLocked: false,
      }),
    );

    // Reload with the join set — the insert can't populate the relations.
    return this.toDto((await this.appsRepo.findById(saved.id))!);
  }

  // Records the Pass/Fail verdict and locks the appointment — Tests insert
  // and lock flip are one transaction; a locked result is permanent.
  async recordResult(
    appointmentId: number,
    dto: RecordTestResultRequestDto,
    actingUserId: number,
  ): Promise<TestAppointmentDto> {
    // 404 when the appointment doesn't exist.
    const appointment = await this.appsRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Test appointment not found');
    }

    // The owning application must still be New.
    const application = await this.appsService.findOne(appointment.llaId);
    if (application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Cannot record results for a ${application.applicationStatus} application`,
      );
    }

    // Double-recording guard: a locked appointment's result is permanent.
    if (appointment.isLocked) {
      throw new ConflictException('This appointment is already locked');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(
          manager.create(Test, {
            appointmentId: appointment.id,
            testResult: dto.result === 'passed',
            notes: dto.notes ?? null,
            createdByUserId: actingUserId,
          }),
        );
        await manager.update(
          TestAppointment,
          { id: appointment.id },
          { isLocked: true },
        );
      });
    } catch (error) {
      // A concurrent record slipping past the lock check hits the unique
      // TestAppointmentID — surface the race as the same 409 (23505).
      if (
        error instanceof QueryFailedError &&
        (error as { driverError?: { code?: string } }).driverError?.code ===
          '23505'
      ) {
        throw new ConflictException('This appointment is already locked');
      }
      throw error;
    }

    return this.toDto((await this.appsRepo.findById(appointment.id))!);
  }

  // Computes the pipeline state: the three stage statuses plus the
  // appointment history, derived from one read of every appointment.
  async getPipeline(llaId: number): Promise<TestPipelineDto> {
    // 404 comes from the applications service (module boundary).
    await this.appsService.findOne(llaId);

    const appointments = await this.appsRepo.findAllForApplication(llaId);

    // Project the stages in seeded order: passed stays 'Passed' forever; the
    // first unpassed stage is 'Scheduled' (open booking) or 'Schedule'; the rest are 'Locked'.
    const stageOrder = await this.lookupService.findAllTestTypes();
    const passedByType = new Set(
      appointments
        .filter((a) => a.test?.testResult === true)
        .map((a) => a.testTypeId),
    );
    const currentIndex = stageOrder.findIndex((t) => !passedByType.has(t.id));
    const stages: TestStageDto[] = stageOrder.map((tt, index) => {
      const latest =
        appointments.find((a) => a.testTypeId === tt.id) ?? null;
      let status: TestStageStatus;
      if (passedByType.has(tt.id)) {
        status = 'Passed';
      } else if (index === currentIndex) {
        status = latest && !latest.isLocked ? 'Scheduled' : 'Schedule';
      } else {
        status = 'Locked';
      }
      return {
        testTypeId: tt.id,
        title: tt.testTypeTitle,
        description: tt.testTypeDescription,
        status,
        appointmentId: latest?.id ?? null,
        appointmentDate: latest ? latest.appointmentDate.toISOString() : null,
        paidFees: latest?.paidFees ?? null,
        testResult: latest?.test?.testResult ?? null,
        notes: latest?.test?.notes ?? null,
      };
    });

    // History: every appointment, newest first.
    return {
      applicationId: llaId,
      stages,
      history: appointments.map((a) => this.toDto(a)),
    };
  }
}