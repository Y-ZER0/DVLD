import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestType } from '../entities/test-type.entity';

@Injectable()
export class TestTypesRepository extends Repository<TestType> {
  constructor(
    @InjectRepository(TestType)
    private readonly testTypeRepo: Repository<TestType>,
  ) {
    super(testTypeRepo.target, testTypeRepo.manager);
  }

  // Full register, in stable id order — also the Vision → Written → Street
  // sequencing order the scheduling rules depend on.
  async findAll(): Promise<TestType[]> {
    return this.find({ order: { id: 'ASC' } });
  }

  // Single-row lookup by id; null when missing.
  async findById(id: number): Promise<TestType | null> {
    return this.findOneBy({ id });
  }
}