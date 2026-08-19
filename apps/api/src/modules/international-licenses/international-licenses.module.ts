import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternationalLicense } from './entities/international-license.entity';
import { InternationalLicensesRepository } from './repositories/international-licenses.repository';
import { InternationalLicensesService } from './international-licenses.service';
import { InternationalLicensesController } from './international-licenses.controller';
import { EligibleInternationalDriversController } from './eligible-international-drivers.controller';
import { LocalLicenseApplicationsModule } from '../local-license-applications/local-license-applications.module';
import { LookupModule } from '../lookup/lookup.module';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InternationalLicense]),
    LocalLicenseApplicationsModule,
    LookupModule,
    LicensesModule,
  ],
  controllers: [
    InternationalLicensesController,
    EligibleInternationalDriversController,
  ],
  providers: [InternationalLicensesService, InternationalLicensesRepository],
})
export class InternationalLicensesModule {}