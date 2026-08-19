import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { DriversService } from './drivers.service';

// DriversModule — owns the Drivers table as its own bounded domain
// (architecture.md module list: drivers/ # Drivers + aggregated history
// views, Feature 10). Created during 6.1 because license issuance requires
// the find-or-create (invariant #23); Feature 10 extends this module with
// the repository + history/register endpoints. No repository class exists
// yet: the only read (find-or-create) must run on the caller's transaction
// manager, and a repository would be dead code (same reasoning as the
// deliberately absent TestsRepository, Session 14). DriversService is
// exported — cross-module consumers (licenses issuance) go through it,
// never a foreign repository (architecture.md § System Boundaries).
@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}