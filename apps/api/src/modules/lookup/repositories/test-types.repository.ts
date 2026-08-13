import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestType } from '../entities/test-type.entity';

// TestTypesRepository — read-only data access for the TestTypes lookup table
// (build-plan.md § 3.1; edits arrive with Feature 11). Mirrors the
// PeopleRepository pattern: extends Repository, pure TypeORM calls, no
// business rules.
@Injectable()
export class TestTypesRepository extends Repository<TestType> {
  constructor(
    @InjectRepository(TestType)
    private readonly testTypeRepo: Repository<TestType>,
  ) {
    super(testTypeRepo.target, testTypeRepo.manager);
  }

  // Full register — plain array, not paginated (Session 11 ARCHITECT
  // decision): 3 seeded types. The id order doubles as the Vision → Written
  // → Street sequence the scheduling rules depend on (invariant #19).
  async findAll(): Promise<TestType[]> {
    // STEP 1: Stable id order — also the canonical test staging order.
    return this.find({ order: { id: 'ASC' } });
  }
}