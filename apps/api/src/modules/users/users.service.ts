import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { UserDto } from '@repo/shared';
import { PeopleService } from '../people/people.service';
import {
  FindAllUsersParams,
  PaginatedUsers,
  UsersRepository,
} from './repositories/users.repository';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateUserPasswordRequestDto } from './dtos/update-user-password-request.dto';
import { UpdateUserStatusRequestDto } from './dtos/update-user-status-request.dto';
import { User } from './entities/user.entity';

// UsersService — the account-domain business rules (build-plan.md § 2.1):
// every account is linked to exactly one person who isn't already linked,
// passwords are bcrypt-hashed at cost 12 (library-docs.md § 3), and the
// password hash never leaves this layer — every return path projects
// through toDto() (invariants #11 + #15).
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly peopleService: PeopleService,
  ) {}

  // Projects a User entity (always with its joined Person) into the
  // shared flat UserDto — the only shape that crosses the API boundary
  // (invariant #11). The hash is absent here by construction because the
  // DTO doesn't have a field for it (invariant #15).
  private toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      personId: user.personId,
      personName: `${user.person.firstName} ${user.person.lastName}`,
      nationalNumber: user.person.nationalNumber,
      isActive: user.isActive,
    };
  }

  // Paginated + filterable account list for the 2.2 register screen —
  // thin pass-through of the repository result, projected row by row.
  async findAll(
    params: FindAllUsersParams,
  ): Promise<{ data: UserDto[]; meta: PaginatedUsers['meta'] }> {
    // STEP 1: Fetch the page entities; the repository owns WHERE/ORDER/
    //         pagination (and the person join), so rows and meta agree.
    const { data, meta } = await this.usersRepo.findAll(params);
    // STEP 2: Map every row across the toDto gate — no entity leaves this
    //         service (invariant #11).
    return { data: data.map((user) => this.toDto(user)), meta };
  }

  // Registers a new account for a person who has none. Guard order
  // matters: 404 for a person that doesn't exist, 409 for one already
  // linked or a taken username — all checked before any write.
  async create(dto: CreateUserRequestDto): Promise<UserDto> {
    // STEP 1: The target person must exist. Reusing PeopleService keeps
    //         the person domain's own 404 semantics (and boundary —
    //         cross-module reads go through the exported service, never
    //         a foreign repository).
    await this.peopleService.findOne(dto.personId);

    // STEP 2: Reject linking a person who already has an account — the
    //         schema allows at most one User per Person, and a duplicate
    //         would otherwise surface as an FK/constraint 500 instead of
    //         a clean 409.
    const existing = await this.usersRepo.findByPersonId(dto.personId);
    if (existing) {
      throw new ConflictException('This person already has a user account');
    }

    // STEP 3: Username uniqueness, pre-checked for a clean 409 — the
    //         unique Username column backs this up as a second line of
    //         defense against races.
    const usernameTaken = await this.usersRepo.findByUsername(dto.username);
    if (usernameTaken) {
      throw new ConflictException(`Username "${dto.username}" is already taken`);
    }

    // STEP 4: Hash before persist — cost factor 12 per library-docs § 3;
    //         only the hash ever touches the database (invariant #15).
    //         New accounts default to active.
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const saved = await this.usersRepo.save(
      this.usersRepo.create({
        personId: dto.personId,
        username: dto.username,
        passwordHash,
        isActive: true,
      }),
    );

    // STEP 5: Re-fetch with the person join — the insert can't produce a
    //         populated relation, and toDto needs the display fields.
    const created = await this.usersRepo.findById(saved.id);
    return this.toDto(created as User);
  }

  // Replaces an account's password hash (clerk-initiated reset, no
  // old-password step). The stored value is a fresh cost-12 hash — the
  // plaintext exists only in this request's memory.
  async updatePassword(
    id: number,
    dto: UpdateUserPasswordRequestDto,
  ): Promise<UserDto> {
    // STEP 1: Load the target account first — a missing id is a 404, and
    //         we never hash for a row that doesn't exist.
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // STEP 2: Re-hash at cost 12 and persist — the raw password never
    //         reaches the repository (invariant #15).
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersRepo.updatePassword(id, passwordHash);

    // STEP 3: Reload for the toDto projection (the update helper doesn't
    //         return the joined person).
    const updated = await this.usersRepo.findById(id);
    return this.toDto(updated as User);
  }

  // Flips the account's IsActive flag. JwtStrategy re-checks the flag on
  // every authenticated request, so a deactivation is effective at the
  // very next call — no token revocation needed (Session 2 decision).
  async updateStatus(
    id: number,
    dto: UpdateUserStatusRequestDto,
  ): Promise<UserDto> {
    // STEP 1: 404 on a missing account before touching the flag.
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // STEP 2: Persist the new flag, then reload for the toDto projection.
    await this.usersRepo.setActive(id, dto.isActive);
    const updated = await this.usersRepo.findById(id);
    return this.toDto(updated as User);
  }

  // Removes an account row. Hard delete (the everyday "remove this
  // login" action is the IsActive toggle instead, Session 6 decision);
  // an account that created business records (Drivers, Applications) is
  // protected by the FK and surfaces as a 409, not a raw 500.
  async remove(id: number): Promise<{ id: number }> {
    // STEP 1: Confirm the row exists so a missing id is a clean 404
    //         rather than an "affected 0 rows" ambiguity.
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // STEP 2: Perform the delete inside the try so the FK-guard catch
      //         below can translate the DB error into a domain response.
      await this.usersRepo.remove(user);
      return { id };
    } catch (error) {
      // STEP 3: Postgres raises foreign_key_violation (23503) when this
      //         account is referenced by Drivers/Applications — same
      //         guard as People deletion: an account with an audit trail
      //         cannot silently disappear; deactivate it instead.
      if (error instanceof QueryFailedError && error.driverError?.code === '23503') {
        throw new ConflictException(
          'Cannot delete user: this account has linked business records',
        );
      }
      throw error;
    }
  }
}