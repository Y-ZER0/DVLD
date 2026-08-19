import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetainedLicense } from './entities/detained-license.entity';
import { DetainedLicensesRepository } from './repositories/detained-licenses.repository';
import { DetainReleaseService } from './detain-release.service';
import { DetainReleaseController } from './detain-release.controller';
import { LocalLicenseApplicationsModule } from '../local-license-applications/local-license-applications.module';
import { LookupModule } from '../lookup/lookup.module';
import { LicensesModule } from '../licenses/licenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetainedLicense]),
    forwardRef(() => LicensesModule),
    LocalLicenseApplicationsModule,
    LookupModule,
  ],
  controllers: [DetainReleaseController],
  providers: [DetainReleaseService, DetainedLicensesRepository],
  exports: [DetainReleaseService],
})
export class DetainReleaseModule {}