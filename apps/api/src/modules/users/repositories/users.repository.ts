import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface FindAllUsersParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedUsers {
  data: User[];
  meta: { total: number; page: number; pageSize: number };
}

// UsersRepository — the users domain's data access layer.
@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(userRepo.target, userRepo.manager);
  }

  // Login lookup: only query allowed to see the password hash (opt back in
  // past the column's select: false), left-joining the person for the response.
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.username = :username', { username })
      .getOne();
  }

  // Paginated list: count and page share one query builder with the optional
  // free-text search across the username and the linked person's display fields.
  async findAll(params: FindAllUsersParams): Promise<PaginatedUsers> {
    const qb = this.createQueryBuilder('user').leftJoinAndSelect(
      'user.person',
      'person',
    );

    if (params.search) {
      const like = `%${params.search.toLowerCase()}%`;
      qb.where(
        '(LOWER(user.username) LIKE :like OR LOWER(person.firstName) LIKE :like ' +
          'OR LOWER(person.lastName) LIKE :like OR LOWER(person.nationalNumber) LIKE :like)',
        { like },
      );
    }

    const total = await qb.getCount();

    // Newest first; skip/take implement the page window.
    const data = await qb
      .orderBy('user.id', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getMany();

    return { data, meta: { total, page: params.page, pageSize: params.pageSize } };
  }

  // Single-row lookup with the person join (all response paths need it).
  async findById(id: number): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.id = :id', { id })
      .getOne();
  }

  // Plain username lookup WITHOUT the hash — the create() uniqueness guard.
  async findByUsername(username: string): Promise<User | null> {
    return this.findOneBy({ username });
  }

  // Whether the person already has an account — the create() already-linked guard.
  async findByPersonId(personId: number): Promise<User | null> {
    return this.findOneBy({ personId });
  }

  // Replaces the password hash; only ever called with a fresh bcrypt hash.
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.update({ id }, { passwordHash });
  }

  // Flips the IsActive flag.
  async setActive(id: number, isActive: boolean): Promise<void> {
    await this.update({ id }, { isActive });
  }
}