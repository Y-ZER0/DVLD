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

// LookupService — the read-only façade over the three configuration tables
// (build-plan.md § 3.1). Entities never leave this module (invariant #11):
// every method maps through a private toDto gate before returning. Future
// features needing a config value (4.1's age gate, 5.1's fee snapshots,
// 9.1's release-fee read) import THIS service — never a foreign repository
// (architecture.md § System Boundaries).
@Injectable()
export class LookupService {
  constructor(
    private readonly licenseClassesRepository: LicenseClassesRepository,
    private readonly applicationTypesRepository: ApplicationTypesRepository,
    private readonly testTypesRepository: TestTypesRepository,
  ) {}

  // Full license-class register — consumed by the 4.2 "Select license
  // class" dropdown ("Min age N" inline labels) and the 4.1 age gate.
  async findAllLicenseClasses(): Promise<LicenseClassDto[]> {
    // STEP 1: Read the rows, then project every entity through the DTO
    //         gate — the raw entity shape never crosses the boundary.
    return (await this.licenseClassesRepository.findAll()).map((entity) =>
      this.toLicenseClassDto(entity),
    );
  }

  // Single class by id — the 4.1 age-gate lookup (and 6.1's
  // validity-length read): precise single-row fetch, no full-register scan.
  // Returns null for a missing id; the caller maps it to a 404.
  async findLicenseClassById(id: number): Promise<LicenseClassDto | null> {
    // STEP 1: Read the entity, then project through the same toDto gate —
    //         the caller never sees the raw row (invariant #11).
    const entity = await this.licenseClassesRepository.findById(id);
    return entity ? this.toLicenseClassDto(entity) : null;
  }

  // Full application-type register — the fee source for Feature 4+ fee
  // snapshots (invariant #28) and the "fee notice" text on future modals.
  async findAllApplicationTypes(): Promise<ApplicationTypeDto[]> {
    return (await this.applicationTypesRepository.findAll()).map((entity) =>
      this.toApplicationTypeDto(entity),
    );
  }

  // Single application type by its enum label — the 4.1 fee-snapshot
  // source (read the NewDrivingLicense row at create time, invariant #28).
  // Returns null for a missing row; the caller decides how to surface it.
  async findApplicationTypeByTitle(
    title: ApplicationTypeEnum,
  ): Promise<ApplicationTypeDto | null> {
    const entity = await this.applicationTypesRepository.findByTitle(title);
    return entity ? this.toApplicationTypeDto(entity) : null;
  }

  // Full test-type register — powers the 5.2 stepper's fee labels and the
  // test sequencing rules (Vision → Written → Street, invariant #19).
  async findAllTestTypes(): Promise<TestTypeDto[]> {
    return (await this.testTypesRepository.findAll()).map((entity) =>
      this.toTestTypeDto(entity),
    );
  }

  // Single test type by id — the 5.1 fee-snapshot source (schedule() reads
  // TestTypes.TestTypeFees at booking time, invariant #28) and its 404
  // gate. Returns null for a missing id; the caller maps it to a 404.
  async findTestTypeById(id: number): Promise<TestTypeDto | null> {
    // STEP 1: Read the entity, then project through the same toDto gate —
    //         the caller never sees the raw row (invariant #11).
    const entity = await this.testTypesRepository.findById(id);
    return entity ? this.toTestTypeDto(entity) : null;
  }

  // STEP-gates: flat projections, no entity leaks (invariant #11). Fee
  // columns pass through as strings — decimal columns arrive as strings
  // and client-side display needs no numeric coercion (Session 11 ARCHITECT
  // decision).
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