import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// Query params accepted by findAll — page/pageSize drive pagination,
// search is the single free-text filter (username + linked person's
// name/national number, see findAll below).
export interface FindAllUsersParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedUsers {
  data: User[];
  meta: { total: number; page: number; pageSize: number };
}

// UsersRepository — the users domain's data access layer. Pure TypeORM
// calls only; business rules (404s, duplicates, FK guards) live in
// UsersService. Extends Repository so callers get the full TypeORM
// surface plus the custom methods below.
@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below. The queryRunner arg is omitted — it is
    //         deprecated in the Repository constructor and unused here.
    super(userRepo.target, userRepo.manager);
  }

  // Loads a user by username WITH the password hash — the only query in
  // the system that may see it (invariant #15). Used exclusively by the
  // auth login path, never by any response-facing query.
  async findByUsernameWithPassword(username: string): Promise<User | null> {
    // STEP 1: The Password column carries select: false, so a plain find
    //         would never return the hash — opt back in explicitly for
    //         the one query that must do a bcrypt.compare.
    // STEP 2: Left-join the linked People row in the same query so the
    //         login response gets personId/fullName without a second trip.
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.username = :username', { username })
      .getOne();
  }

  // Paginated list for the 2.2 DataTable: every account joined with its
  // People row, one optional free-text filter across the username and the
  // linked person's name/national number, newest first.
  async findAll(params: FindAllUsersParams): Promise<PaginatedUsers> {
    // STEP 1: Build a single query builder so the count and the page
    //         share one WHERE clause — with a filter applied, the two
    //         must never disagree about what is in the result set.
    const qb = this.createQueryBuilder('user').leftJoinAndSelect(
      'user.person',
      'person',
    );

    // STEP 2: One free-text search param (same contract as GET /people)
    //         matches the username AND the display fields of the linked
    //         person — LOWER/LIKE so case never hides a row.
    if (params.search) {
      const like = `%${params.search.toLowerCase()}%`;
      qb.where(
        '(LOWER(user.username) LIKE :like OR LOWER(person.firstName) LIKE :like ' +
          'OR LOWER(person.lastName) LIKE :like OR LOWER(person.nationalNumber) LIKE :like)',
        { like },
      );
    }

    // STEP 3: total is the filtered set's size, computed from the same
    //         qb before pagination offsets apply.
    const total = await qb.getCount();

    // STEP 4: Newest accounts first (UserID DESC); skip/take implement
    //         the page window.
    const data = await qb
      .orderBy('user.id', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getMany();

    return { data, meta: { total, page: params.page, pageSize: params.pageSize } };
  }

  // Loads a user by id WITH their People row — the response path for
  // every single-record call (the Users screens render the linked
  // person's name/national number, and jwt.strategy re-checks the row on
  // every authenticated request).
  async findById(id: number): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.id = :id', { id })
      .getOne();
  }

  // Plain username lookup WITHOUT the hash — the create() uniqueness
  // guard. (The auth path uses findByUsernameWithPassword instead.)
  async findByUsername(username: string): Promise<User | null> {
    return this.findOneBy({ username });
  }

  // Whether a given Person row already has an account — the create()
  // already-linked guard (a person holds at most one User row).
  async findByPersonId(personId: number): Promise<User | null> {
    return this.findOneBy({ personId });
  }

  // Replaces the password hash on an existing account. Only ever called
  // with a freshly bcrypt-hashed value produced by the service
  // (invariant #15 — the raw password never reaches this layer).
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.update({ id }, { passwordHash });
  }

  // Flips the account's IsActive flag; the auth strategy reads it on
  // every request, so the change is live immediately.
  async setActive(id: number, isActive: boolean): Promise<void> {
    await this.update({ id }, { isActive });
  }
}