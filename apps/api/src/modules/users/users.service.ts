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

// UsersService — account business rules: one account per person, bcrypt-hashed
// passwords (cost 12), and the hash never leaves this layer.
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly peopleService: PeopleService,
  ) {}

  // Projects a User (with its joined Person) into the shared UserDto.
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

  // Paginated account list for the users register screen.
  async findAll(
    params: FindAllUsersParams,
  ): Promise<{ data: UserDto[]; meta: PaginatedUsers['meta'] }> {
    const { data, meta } = await this.usersRepo.findAll(params);
    return { data: data.map((user) => this.toDto(user)), meta };
  }

  // Creates an account for an unlinked person. Guard order: 404 for a missing
  // person, 409 for an already-linked person or a taken username.
  async create(dto: CreateUserRequestDto): Promise<UserDto> {
    // The target person must exist (PeopleService keeps the 404 semantics).
    await this.peopleService.findOne(dto.personId);

    // A person may hold at most one account.
    const existing = await this.usersRepo.findByPersonId(dto.personId);
    if (existing) {
      throw new ConflictException('This person already has a user account');
    }

    // Usernames must be unique.
    const usernameTaken = await this.usersRepo.findByUsername(dto.username);
    if (usernameTaken) {
      throw new ConflictException(`Username "${dto.username}" is already taken`);
    }

    // Hash before persist; only the hash touches the database. New accounts default to active.
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const saved = await this.usersRepo.save(
      this.usersRepo.create({
        personId: dto.personId,
        username: dto.username,
        passwordHash,
        isActive: true,
      }),
    );

    // Re-fetch with the person join — the insert can't populate the relation.
    const created = await this.usersRepo.findById(saved.id);
    return this.toDto(created as User);
  }

  // Replaces the account's password hash (clerk-initiated reset, cost 12).
  async updatePassword(
    id: number,
    dto: UpdateUserPasswordRequestDto,
  ): Promise<UserDto> {
    // 404 when the account doesn't exist.
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersRepo.updatePassword(id, passwordHash);

    // Reload for the toDto projection.
    const updated = await this.usersRepo.findById(id);
    return this.toDto(updated as User);
  }

  // Flips the IsActive flag; the JWT strategy re-checks it on every request.
  async updateStatus(
    id: number,
    dto: UpdateUserStatusRequestDto,
  ): Promise<UserDto> {
    // 404 when the account doesn't exist.
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepo.setActive(id, dto.isActive);
    const updated = await this.usersRepo.findById(id);
    return this.toDto(updated as User);
  }

  // Hard delete; accounts referenced by business records surface as a 409 (FK violation).
  async remove(id: number): Promise<{ id: number }> {
    // 404 when the account doesn't exist.
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.usersRepo.remove(user);
      return { id };
    } catch (error) {
      // FK violation (23503) = linked records exist; surface as a clean 409.
      if (error instanceof QueryFailedError && error.driverError?.code === '23503') {
        throw new ConflictException(
          'Cannot delete user: this account has linked business records',
        );
      }
      throw error;
    }
  }
}