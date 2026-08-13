import { Injectable } from '@nestjs/common';
import { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from '@repo/shared';
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

  // Full application-type register — the fee source for Feature 4+ fee
  // snapshots (invariant #28) and the "fee notice" text on future modals.
  async findAllApplicationTypes(): Promise<ApplicationTypeDto[]> {
    return (await this.applicationTypesRepository.findAll()).map((entity) =>
      this.toApplicationTypeDto(entity),
    );
  }

  // Full test-type register — powers the 5.2 stepper's fee labels and the
  // test sequencing rules (Vision → Written → Street, invariant #19).
  async findAllTestTypes(): Promise<TestTypeDto[]> {
    return (await this.testTypesRepository.findAll()).map((entity) =>
      this.toTestTypeDto(entity),
    );
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