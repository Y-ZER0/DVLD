import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseClass } from '../entities/license-class.entity';

// LicenseClassesRepository — read-only data access for the LicenseClasses
// lookup table (build-plan.md § 3.1: findAll only; edits arrive with Feature
// 11's configuration screen). Mirrors the PeopleRepository pattern: extends
// Repository, pure TypeORM calls, no business rules.
@Injectable()
export class LicenseClassesRepository extends Repository<LicenseClass> {
  constructor(
    @InjectRepository(LicenseClass)
    private readonly licenseClassRepo: Repository<LicenseClass>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below.
    super(licenseClassRepo.target, licenseClassRepo.manager);
  }

  // Full register — plain array, not paginated (Session 11 ARCHITECT
  // decision): the table holds the 7 seeded classes and its consumers are
  // dropdowns and fee lookups, never grids.
  async findAll(): Promise<LicenseClass[]> {
    // STEP 1: Stable id order so dropdowns read the seeded sequence
    //         deterministically between requests.
    return this.find({ order: { id: 'ASC' } });
  }
}