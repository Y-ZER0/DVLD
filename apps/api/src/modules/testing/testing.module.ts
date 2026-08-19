import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestAppointment } from './entities/test-appointment.entity';
import { Test } from './entities/test.entity';
import { TestAppointmentsRepository } from './repositories/test-appointments.repository';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { LocalLicenseApplicationsModule } from '../local-license-applications/local-license-applications.module';
import { LookupModule } from '../lookup/lookup.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestAppointment, Test]),
    LocalLicenseApplicationsModule,
    LookupModule,
  ],
  controllers: [TestingController],
  providers: [TestingService, TestAppointmentsRepository],
  exports: [TestingService],
})
export class TestingModule {}