import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { LocalDrivingLicenseApplication } from './entities/local-driving-license-application.entity';
import { LocalLicenseApplicationsRepository } from './repositories/local-license-applications.repository';
import { LocalLicenseApplicationsService } from './local-license-applications.service';
import { LocalLicenseApplicationsController } from './local-license-applications.controller';
import { PeopleModule } from '../people/people.module';
import { LookupModule } from '../lookup/lookup.module';

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