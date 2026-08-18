import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestAppointment } from './entities/test-appointment.entity';
import { Test } from './entities/test.entity';
import { TestAppointmentsRepository } from './repositories/test-appointments.repository';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { LocalLicenseApplicationsModule } from '../local-license-applications/local-license-applications.module';
import { LookupModule } from '../lookup/lookup.module';

// TestingModule — owns TestAppointments + Tests as one bounded domain
// (build-plan.md § 5.1, architecture.md module list): the sequencing,
// locking, and fee-snapshot rules of the test pipeline. Cross-module reads
// go through exported services only: LocalLicenseApplicationsService for
// the owning application (404 + status gates) and LookupService for the
// stage order + fee snapshot — never a foreign repository
// (architecture.md § System Boundaries).
@Module({
  imports: [
    TypeOrmModule.forFeature([TestAppointment, Test]),
    LocalLicenseApplicationsModule,
    LookupModule,
  ],
  controllers: [TestingController],
  providers: [TestingService, TestAppointmentsRepository],
})
export class TestingModule {}