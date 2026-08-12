import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// UsersRepository — the users domain's data access layer. Feature 2 later
// extends this with findAll/create/updatePassword/setActive; today it only
// exposes the two auth-scoped reads the login flow needs.
@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below.
    super(userRepo.target, userRepo.manager, userRepo.queryRunner);
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

  // Loads a user by id with their People row — used by JwtStrategy on
  // every authenticated request to re-confirm the account still exists
  // and is active, so deactivation takes effect immediately.
  async findByIdWithPerson(id: number): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.id = :id', { id })
      .getOne();
  }
}