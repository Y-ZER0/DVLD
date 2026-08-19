import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationType as ApplicationTypeEnum } from '@repo/shared';
import { ApplicationType } from '../entities/application-type.entity';

@Injectable()
export class ApplicationTypesRepository extends Repository<ApplicationType> {
  constructor(
    @InjectRepository(ApplicationType)
    private readonly applicationTypeRepo: Repository<ApplicationType>,
  ) {
    super(applicationTypeRepo.target, applicationTypeRepo.manager);
  }

  // Full register, in stable id order.
  async findAll(): Promise<ApplicationType[]> {
    return this.find({ order: { id: 'ASC' } });
  }

  // Single-row lookup by enum label — the stored column IS the label.
  async findByTitle(title: ApplicationTypeEnum): Promise<ApplicationType | null> {
    return this.findOneBy({ applicationTypeTitle: title });
  }
}