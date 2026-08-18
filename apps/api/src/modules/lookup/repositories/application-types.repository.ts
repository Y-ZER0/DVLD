import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationType as ApplicationTypeEnum } from '@repo/shared';
import { ApplicationType } from '../entities/application-type.entity';

// ApplicationTypesRepository — read-only data access for the
// ApplicationTypes lookup table (build-plan.md § 3.1; edits arrive with
// Feature 11). Mirrors the PeopleRepository pattern: extends Repository,
// pure TypeORM calls, no business rules.
@Injectable()
export class ApplicationTypesRepository extends Repository<ApplicationType> {
  constructor(
    @InjectRepository(ApplicationType)
    private readonly applicationTypeRepo: Repository<ApplicationType>,
  ) {
    super(applicationTypeRepo.target, applicationTypeRepo.manager);
  }

  // Full register — plain array, not paginated (Session 11 ARCHITECT
  // decision): 6 seeded types, consumed by dropdowns and fee lookups.
  async findAll(): Promise<ApplicationType[]> {
    // STEP 1: Stable id order so dropdowns read the seeded sequence
    //         deterministically between requests.
    return this.find({ order: { id: 'ASC' } });
  }

  // Single-row lookup by enum label — the 4.1 fee-snapshot source (read the
  // NewDrivingLicense row at create time, invariant #28). The column stores
  // the label, so the enum value IS the query key. Returns null so the
  // caller decides the error.
  async findByTitle(title: ApplicationTypeEnum): Promise<ApplicationType | null> {
    return this.findOneBy({ applicationTypeTitle: title });
  }
}