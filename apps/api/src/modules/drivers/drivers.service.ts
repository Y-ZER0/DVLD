import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Driver } from './entities/driver.entity';

// DriversService — minimal surface for Feature 6.1 (build-plan.md § 6.1,
// architecture.md module list: drivers/ owns Drivers + future history
// views, Feature 10). One responsibility today: the transactional
// find-or-create that license issuance needs (invariant #23 — a License
// and its Driver must never exist apart, so both writes run in the
// caller's transaction).
@Injectable()
export class DriversService {
  // Finds the person's driver row, creating it if missing — executed
  // through the caller's EntityManager so the create participates in
  // license issuance's ONE transaction (invariant #23: never two
  // separate, non-atomic writes). The manager is passed in deliberately:
  // a repository-injected call would run on its own connection, outside
  // the caller's transaction, and the uniqueness guarantee would silently
  // degrade to a best-effort pre-check.
  async findOrCreateByPersonId(
    manager: EntityManager,
    personId: number,
    actingUserId: number,
  ): Promise<Driver> {
    // STEP 1: The common path — the person already has a Drivers row (they
    //         were issued some other license before); reuse it inside the
    //         transaction so a concurrent first-issuance for the same
    //         person still sees consistent state.
    const existing = await manager.findOne(Driver, { where: { personId } });
    if (existing) {
      return existing;
    }

    // STEP 2: First license ever for this person — create the driver record
    //         here, in the caller's transaction, stamped with the session
    //         user (invariant #29). The DB's unique PersonID backstops a
    //         simultaneous find-then-create from a parallel issuance: one
    //         of them gets a 23505 and its whole transaction rolls back,
    //         leaving exactly one Drivers row — no retry logic needed,
    //         because the loser's license insert fails with it.
    return manager.save(
      manager.create(Driver, {
        personId,
        createdByUserId: actingUserId,
        createdDate: new Date(),
      }),
    );
  }
}