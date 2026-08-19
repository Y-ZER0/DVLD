import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../entities/license.entity';

// LicensesRepository — the licenses domain's data access layer
// (build-plan.md § 6.1, PeopleRepository/LocalLicenseApplicationsRepository
// pattern). Pure TypeORM calls only; business rules (pipeline gate,
// fee snapshot, validity computation, completion) live in the service.
// The transactional writes (license insert + application completion) go
// through the service's dataSource.transaction manager — this repository
// carries only the reads.
@Injectable()
export class LicensesRepository extends Repository<License> {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below.
    super(licenseRepo.target, licenseRepo.manager);
  }

  // Every read joins the driver (+ its person, for name/national number)
  // and the license class — the LicenseDto projection needs them on all
  // return paths, so the join is always-on.
  private joinedQb() {
    return this.createQueryBuilder('license')
      .leftJoinAndSelect('license.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person')
      .leftJoinAndSelect('license.licenseClass', 'licenseClass');
  }

  // Single license with the full join set — the service's reload-after-
  // insert path (post-transaction projection) and the future detail
  // surface. Returns null so the service decides the 404.
  async findById(id: number): Promise<License | null> {
    return this.joinedQb().where('license.id = :id', { id }).getOne();
  }
}