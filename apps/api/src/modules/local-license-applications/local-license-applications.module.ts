import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { LocalDrivingLicenseApplication } from './entities/local-driving-license-application.entity';
import { LocalLicenseApplicationsRepository } from './repositories/local-license-applications.repository';
import { LocalLicenseApplicationsService } from './local-license-applications.service';
import { LocalLicenseApplicationsController } from './local-license-applications.controller';
import { PeopleModule } from '../people/people.module';
import { LookupModule } from '../lookup/lookup.module';

// LocalLicenseApplicationsModule — owns the Applications +
// LocalDrivingLicenseApplications pair as one bounded domain
// (build-plan.md § 4.1, architecture.md module list). Cross-module reads
// go through exported services only: PeopleService for the applicant (404
// semantics) and LookupService for the age gate + fee snapshot — never a
// foreign repository (architecture.md § System Boundaries).
// Exports LocalLicenseApplicationsService since Session 14 (5.1): the
// testing module consumes it for the owning-application 404 + status gates
// (Session 12 note "5.1 will need the service — add then").
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, LocalDrivingLicenseApplication]),
    PeopleModule,
    LookupModule,
  ],
  controllers: [LocalLicenseApplicationsController],
  providers: [LocalLicenseApplicationsService, LocalLicenseApplicationsRepository],
  exports: [LocalLicenseApplicationsService],
})
export class LocalLicenseApplicationsModule {}