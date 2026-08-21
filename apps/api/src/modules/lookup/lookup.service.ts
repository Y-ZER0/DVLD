import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationType as ApplicationTypeEnum,
  ApplicationTypeDto,
  LicenseClassDto,
  TestTypeDto,
} from '@repo/shared';
import { ApplicationType } from './entities/application-type.entity';
import { LicenseClass } from './entities/license-class.entity';
import { TestType } from './entities/test-type.entity';
import { UpdateApplicationTypeRequestDto } from './dtos/update-application-type-request.dto';
import { UpdateLicenseClassRequestDto } from './dtos/update-license-class-request.dto';
import { UpdateTestTypeRequestDto } from './dtos/update-test-type-request.dto';
import { ApplicationTypesRepository } from './repositories/application-types.repository';
import { LicenseClassesRepository } from './repositories/license-classes.repository';
import { TestTypesRepository } from './repositories/test-types.repository';

// LookupService — façade over the three configuration tables; writes affect only the lookup row.
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

  // PATCH a license class — single-field partial update, className is immutable.
  async updateLicenseClass(
    id: number,
    dto: UpdateLicenseClassRequestDto,
  ): Promise<LicenseClassDto> {
    const entity = await this.licenseClassesRepository.findById(id);
    if (!entity) throw new NotFoundException('License class not found');
    if (
      dto.minimumAllowedAge === undefined &&
      dto.defaultValidityLength === undefined &&
      dto.classFees === undefined
    )
      throw new BadRequestException('At least one field must be provided');
    if (dto.minimumAllowedAge !== undefined)
      entity.minimumAllowedAge = dto.minimumAllowedAge;
    if (dto.defaultValidityLength !== undefined)
      entity.defaultValidityLength = dto.defaultValidityLength;
    if (dto.classFees !== undefined) entity.classFees = dto.classFees.toFixed(2);
    return this.toLicenseClassDto(await this.licenseClassesRepository.save(entity));
  }

  // PATCH an application type — fee only, title is immutable.
  async updateApplicationType(
    id: number,
    dto: UpdateApplicationTypeRequestDto,
  ): Promise<ApplicationTypeDto> {
    const entity = await this.applicationTypesRepository.findById(id);
    if (!entity) throw new NotFoundException('Application type not found');
    if (dto.applicationFees === undefined)
      throw new BadRequestException('At least one field must be provided');
    entity.applicationFees = dto.applicationFees.toFixed(2);
    return this.toApplicationTypeDto(
      await this.applicationTypesRepository.save(entity),
    );
  }

  // PATCH a test type — fee only, title and description are immutable.
  async updateTestType(
    id: number,
    dto: UpdateTestTypeRequestDto,
  ): Promise<TestTypeDto> {
    const entity = await this.testTypesRepository.findById(id);
    if (!entity) throw new NotFoundException('Test type not found');
    if (dto.testTypeFees === undefined)
      throw new BadRequestException('At least one field must be provided');
    entity.testTypeFees = dto.testTypeFees.toFixed(2);
    return this.toTestTypeDto(await this.testTypesRepository.save(entity));
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