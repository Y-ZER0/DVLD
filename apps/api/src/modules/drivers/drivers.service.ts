import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Driver } from './entities/driver.entity';

// DriversService — transactional find-or-create for license issuance.
@Injectable()
export class DriversService {
  // Finds the person's driver row, creating it if missing. Runs on the
  // caller's EntityManager so the create participates in the caller's
  // transaction; the DB's unique PersonID backstops concurrent creates.
  async findOrCreateByPersonId(
    manager: EntityManager,
    personId: number,
    actingUserId: number,
  ): Promise<Driver> {
    // Common path: the person already has a driver row.
    const existing = await manager.findOne(Driver, { where: { personId } });
    if (existing) {
      return existing;
    }

    // First license ever — create the driver row in the caller's transaction.
    return manager.save(
      manager.create(Driver, {
        personId,
        createdByUserId: actingUserId,
        createdDate: new Date(),
      }),
    );
  }
}