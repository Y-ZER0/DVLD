import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationType } from './entities/application-type.entity';
import { LicenseClass } from './entities/license-class.entity';
import { TestType } from './entities/test-type.entity';
import { ApplicationTypesRepository } from './repositories/application-types.repository';
import { LicenseClassesRepository } from './repositories/license-classes.repository';
import { TestTypesRepository } from './repositories/test-types.repository';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';

// LookupModule — owns the three configuration tables (LicenseClasses,
// ApplicationTypes, TestTypes) as one bounded domain (build-plan.md § 3.1,
// architecture.md module list). Read-only for now; Feature 11 adds the
// PATCH endpoints. LookupService is exported — cross-module consumers
// (4.1's age gate, 5.1's fee snapshots) must go through it, never a foreign
// repository (architecture.md § System Boundaries).
@Module({
  imports: [TypeOrmModule.forFeature([LicenseClass, ApplicationType, TestType])],
  controllers: [LookupController],
  providers: [
    LookupService,
    LicenseClassesRepository,
    ApplicationTypesRepository,
    TestTypesRepository,
  ],
  exports: [LookupService],
})
export class LookupModule {}