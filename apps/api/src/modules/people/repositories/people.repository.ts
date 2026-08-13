import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';

// Query params accepted by findAll — page/pageSize drive pagination,
// search is the single free-text filter (see findById below for the
// matched columns). Defined here so controller + service share one shape.
export interface FindAllPeopleParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedPeople {
  data: Person[];
  meta: { total: number; page: number; pageSize: number };
}

// PeopleRepository — the people domain's data access layer. Mirrors the
// UsersRepository pattern (extends Repository so callers get the full
// TypeORM surface plus the custom methods below). Pure TypeORM calls only —
// business rules (duplicates, 404s, FK guards) live in PeopleService.
@Injectable()
export class PeopleRepository extends Repository<Person> {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below. The queryRunner arg is omitted — it is
    //         deprecated in the Repository constructor and unused here.
    super(personRepo.target, personRepo.manager);
  }

  // Paginated list query: one optional free-text filter matched across
  // name/national number/email/phone (build-plan.md 1.1), newest first.
  async findAll(params: FindAllPeopleParams): Promise<PaginatedPeople> {
    // STEP 1: Build a single query builder so the count and the page share
    //         one WHERE clause — otherwise the two drift apart whenever a
    //         filter is applied and the meta.total stops matching the rows.
    const qb = this.createQueryBuilder('person');

    // STEP 2: One free-text search param (agreed contract with 1.2's single
    //         filter input) matches every searchable column case-insensitively
    //         — LOWER() means "N-100" and "n-100" both hit, no normalization
    //         of stored data required.
    if (params.search) {
      const like = `%${params.search.toLowerCase()}%`;
      qb.where(
        '(LOWER(person.firstName) LIKE :like OR LOWER(person.lastName) LIKE :like ' +
          'OR LOWER(person.nationalNumber) LIKE :like OR LOWER(person.email) LIKE :like ' +
          'OR LOWER(person.phone) LIKE :like)',
        { like },
      );
    }

    // STEP 3: total is the filtered set's size, computed from the same qb
    //         before pagination offsets apply.
    const total = await qb.getCount();

    // STEP 4: Newest citizens first (PersonID DESC) so the register reads
    //         naturally; skip/take implement the page window.
    const data = await qb
      .orderBy('person.id', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getMany();

    return { data, meta: { total, page: params.page, pageSize: params.pageSize } };
  }

  // Single-row lookups by the keys the service needs. Each returns null
  // rather than throwing — the service decides 404 vs. 409 per context.
  async findById(id: number): Promise<Person | null> {
    return this.findOneBy({ id });
  }

  // Used by create() to guarantee uniqueness (invariant #25) — the DTO has
  // already enforced the format, so any hit here is a true business-level
  // duplicate.
  async findByNationalNumber(nationalNumber: string): Promise<Person | null> {
    return this.findOneBy({ nationalNumber });
  }

  // The update-path variant: proves uniqueness while excluding the row
  // being edited, so PATCHing a person with their own unchanged National
  // Number is not reported as a duplicate.
  async findByNationalNumberExcluding(
    nationalNumber: string,
    excludeId: number,
  ): Promise<Person | null> {
    return this.createQueryBuilder('person')
      .where('person.nationalNumber = :nationalNumber', { nationalNumber })
      .andWhere('person.id != :excludeId', { excludeId })
      .getOne();
  }

  // Every citizen with NO linked User row — the "Link to Person" feed
  // for User Management (build-plan.md § 2.1). NOT EXISTS over the raw
  // Users table keeps this query inside the people domain: no foreign
  // entity import, and the EXISTS shape matches the Roles-return
  // strategy (option A) already specified in build-plan § 1.2.
  async findUnlinked(): Promise<Person[]> {
    // STEP 1: A person is "unlinked" exactly when no Users row carries
    //         their PersonID; NOT EXISTS is the set-theoretic form of
    //         "has no account". Oldest first so the combobox reads in a
    //         stable register order.
    return this.createQueryBuilder('person')
      .where(
        'NOT EXISTS (SELECT 1 FROM "Users" u WHERE u."PersonID" = person."PersonID")',
      )
      .orderBy('person.id', 'ASC')
      .getMany();
  }
}