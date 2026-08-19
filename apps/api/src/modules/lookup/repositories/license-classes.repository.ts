import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseClass } from '../entities/license-class.entity';

@Injectable()
export class LicenseClassesRepository extends Repository<LicenseClass> {
  constructor(
    @InjectRepository(LicenseClass)
    private readonly licenseClassRepo: Repository<LicenseClass>,
  ) {
    super(licenseClassRepo.target, licenseClassRepo.manager);
  }

  // Full register, in stable id order.
  async findAll(): Promise<LicenseClass[]> {
    return this.find({ order: { id: 'ASC' } });
  }

  // Single-row lookup by id; null when missing.
  async findById(id: number): Promise<LicenseClass | null> {
    return this.findOneBy({ id });
  }

  // Single-row lookup by the exact ClassName; null when missing (invariant
  // #24 names the Car class by wording, so the title is the stable key).
  async findByTitle(title: string): Promise<LicenseClass | null> {
    return this.findOneBy({ className: title });
  }
}