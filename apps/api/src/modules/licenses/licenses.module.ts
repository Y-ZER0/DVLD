import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { LicensesRepository } from './repositories/licenses.repository';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { LocalLicenseApplicationsModule } from '../local-license-applications/local-license-applications.module';
import { LookupModule } from '../lookup/lookup.module';
import { TestingModule } from '../testing/testing.module';
import { DriversModule } from '../drivers/drivers.module';

// LicensesModule — owns the Licenses table and its issuance rules as one
// bounded domain (build-plan.md § 6.1, architecture.md module list:
// licenses/ # "issuance, renewal, replacement"; Features 7/8 extend this
// module). Issue time is a cross-domain touchpoint, so cross-module
// reads/writes go through exported services only (architecture.md § System
// Boundaries — never a foreign repository): LocalLicenseApplicationsService
// for the application (404, status gate, completion), TestingService for
// the pipeline re-verification (invariant #22), LookupService for the
// class fee + validity (invariant #28, library-docs.md § 8), and
// DriversService for the transactional find-or-create (invariant #23).
// The issuance route lives here with the application's path prefix —
// see the controller header for why.
@Module({
  imports: [
    TypeOrmModule.forFeature([License]),
    LocalLicenseApplicationsModule,
    LookupModule,
    TestingModule,
    DriversModule,
  ],
  controllers: [LicensesController],
  providers: [LicensesService, LicensesRepository],
})
export class LicensesModule {}