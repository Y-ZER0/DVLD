import { Injectable } from '@nestjs/common';
import {
  ApplicationType as ApplicationTypeEnum,
  ApplicationTypeDto,
  LicenseClassDto,
  TestTypeDto,
} from '@repo/shared';
import { ApplicationType } from './entities/application-type.entity';
import { LicenseClass } from './entities/license-class.entity';
import { TestType } from './entities/test-type.entity';
import { ApplicationTypesRepository } from './repositories/application-types.repository';
import { LicenseClassesRepository } from './repositories/license-classes.repository';
import { TestTypesRepository } from './repositories/test-types.repository';

// LookupService — read-only façade over the three configuration tables.
@Injectable()
export class LookupService {
  constructor(
    private readonly licenseClassesRepository: LicenseClassesRepository,
    private readonly applicationTypesRepository: ApplicationTypesRepository,
    private readonly testTypesRepository: TestTypesRepository,
  ) {}

  // Full license-class register (dropdowns, age gate).
  async findAllLicenseClasses(): Promise<LicenseClassDto[]> {
    return (await this.licenseClassesRepository.findAll()).map((entity) =>
      this.toLicenseClassDto(entity),
    );
  }

  // Single class by id; null when missing (the caller maps to a 404).
  async findLicenseClassById(id: number): Promise<LicenseClassDto | null> {
    const entity = await this.licenseClassesRepository.findById(id);
    return entity ? this.toLicenseClassDto(entity) : null;
  }

  // Single class by its exact ClassName; null when missing (the
  // international license gate resolves the Car class by title).
  async findLicenseClassByTitle(title: string): Promise<LicenseClassDto | null> {
    const entity = await this.licenseClassesRepository.findByTitle(title);
    return entity ? this.toLicenseClassDto(entity) : null;
  }

  // Full application-type register (fee snapshots).
  async findAllApplicationTypes(): Promise<ApplicationTypeDto[]> {
    return (await this.applicationTypesRepository.findAll()).map((entity) =>
      this.toApplicationTypeDto(entity),
    );
  }

  // Single application type by its enum label; null when missing.
  async findApplicationTypeByTitle(
    title: ApplicationTypeEnum,
  ): Promise<ApplicationTypeDto | null> {
    const entity = await this.applicationTypesRepository.findByTitle(title);
    return entity ? this.toApplicationTypeDto(entity) : null;
  }

  // Full test-type register (stepper labels, sequencing, test fees).
  async findAllTestTypes(): Promise<TestTypeDto[]> {
    return (await this.testTypesRepository.findAll()).map((entity) =>
      this.toTestTypeDto(entity),
    );
  }

  // Single test type by id; null when missing.
  async findTestTypeById(id: number): Promise<TestTypeDto | null> {
    const entity = await this.testTypesRepository.findById(id);
    return entity ? this.toTestTypeDto(entity) : null;
  }

  // Flat projections; fee columns pass through as strings (decimal columns arrive as strings).
  private toLicenseClassDto(entity: LicenseClass): LicenseClassDto {
    return {
      id: entity.id,
      className: entity.className,
      minimumAllowedAge: entity.minimumAllowedAge,
      defaultValidityLength: entity.defaultValidityLength,
      classFees: entity.classFees,
    };
  }

  private toApplicationTypeDto(entity: ApplicationType): ApplicationTypeDto {
    return {
      id: entity.id,
      applicationTypeTitle: entity.applicationTypeTitle,
      applicationFees: entity.applicationFees,
    };
  }

  private toTestTypeDto(entity: TestType): TestTypeDto {
    return {
      id: entity.id,
      testTypeTitle: entity.testTypeTitle,
      testTypeDescription: entity.testTypeDescription,
      testTypeFees: entity.testTypeFees,
    };
  }
}