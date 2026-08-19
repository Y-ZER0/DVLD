import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';

export interface FindAllPeopleParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedPeople {
  data: Person[];
  meta: { total: number; page: number; pageSize: number };
}

// PeopleRepository — the people domain's data access layer.
@Injectable()
export class PeopleRepository extends Repository<Person> {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {
    super(personRepo.target, personRepo.manager);
  }

  // Paginated list: count and page share one query builder with the optional
  // free-text search, so meta.total always matches the returned rows.
  async findAll(params: FindAllPeopleParams): Promise<PaginatedPeople> {
    const qb = this.createQueryBuilder('person');

    // One case-insensitive search param across every searchable column.
    if (params.search) {
      const like = `%${params.search.toLowerCase()}%`;
      qb.where(
        '(LOWER(person.firstName) LIKE :like OR LOWER(person.lastName) LIKE :like ' +
          'OR LOWER(person.nationalNumber) LIKE :like OR LOWER(person.email) LIKE :like ' +
          'OR LOWER(person.phone) LIKE :like)',
        { like },
      );
    }

    const total = await qb.getCount();

    // Newest first; skip/take implement the page window.
    const data = await qb
      .orderBy('person.id', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getMany();

    return { data, meta: { total, page: params.page, pageSize: params.pageSize } };
  }

  // Single-row lookup; null when missing (the service decides 404 vs 409).
  async findById(id: number): Promise<Person | null> {
    return this.findOneBy({ id });
  }

  // Uniqueness guard for create() — any hit is a business-level duplicate.
  async findByNationalNumber(nationalNumber: string): Promise<Person | null> {
    return this.findOneBy({ nationalNumber });
  }

  // Uniqueness guard for update(), excluding the row being edited.
  async findByNationalNumberExcluding(
    nationalNumber: string,
    excludeId: number,
  ): Promise<Person | null> {
    return this.createQueryBuilder('person')
      .where('person.nationalNumber = :nationalNumber', { nationalNumber })
      .andWhere('person.id != :excludeId', { excludeId })
      .getOne();
  }

  // People with no linked Users row ("Link to Person" feed), oldest first.
  async findUnlinked(): Promise<Person[]> {
    return this.createQueryBuilder('person')
      .where(
        'NOT EXISTS (SELECT 1 FROM "Users" u WHERE u."PersonID" = person."PersonID")',
      )
      .orderBy('person.id', 'ASC')
      .getMany();
  }
}