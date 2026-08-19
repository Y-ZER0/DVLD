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