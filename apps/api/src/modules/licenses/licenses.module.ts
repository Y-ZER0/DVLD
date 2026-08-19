import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { LicensesRepository } from './repositories/licenses.repository';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { LicensesRegisterController } from './licenses-register.controller';
import { LocalLicenseApplicationsModule } from '../local-license-applications/local-license-applications.module';
import { LookupModule } from '../lookup/lookup.module';
import { TestingModule } from '../testing/testing.module';
import { DriversModule } from '../drivers/drivers.module';
import { DetainReleaseModule } from '../detain-release/detain-release.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([License]),
    LocalLicenseApplicationsModule,
    LookupModule,
    TestingModule,
    DriversModule,
    forwardRef(() => DetainReleaseModule),
  ],
  controllers: [LicensesController, LicensesRegisterController],
  providers: [LicensesService, LicensesRepository],
  exports: [LicensesService],
})
export class LicensesModule {}