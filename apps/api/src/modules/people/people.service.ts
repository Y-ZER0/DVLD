import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Gender, PersonDto } from '@repo/shared';
import {
  FindAllPeopleParams,
  PaginatedPeople,
  PeopleRepository,
} from './repositories/people.repository';
import { CreatePersonRequestDto } from './dtos/create-person-request.dto';
import { UpdatePersonRequestDto } from './dtos/update-person-request.dto';
import { Person } from './entities/person.entity';

// PeopleService — business rules for the citizen registry.
@Injectable()
export class PeopleService {
  constructor(private readonly peopleRepo: PeopleRepository) {}

  // Projects a Person entity into the shared PersonDto; entities never cross the API boundary.
  private toDto(person: Person): PersonDto {
    return {
      id: person.id,
      nationalNumber: person.nationalNumber,
      firstName: person.firstName,
      lastName: person.lastName,
      dateOfBirth: person.dateOfBirth,
      photoUrl: person.photoUrl ?? undefined,
      gender: person.gender,
      address: person.address,
      phone: person.phone,
      email: person.email,
      countryName: person.countryName,
    };
  }

  // Paginated, filterable register for the People screen.
  async findAll(
    params: FindAllPeopleParams,
  ): Promise<{ data: PersonDto[]; meta: PaginatedPeople['meta'] }> {
    const { data, meta } = await this.peopleRepo.findAll(params);
    return { data: data.map((person) => this.toDto(person)), meta };
  }

  // Single citizen lookup; 404 when missing.
  async findOne(id: number): Promise<PersonDto> {
    const person = await this.peopleRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    return this.toDto(person);
  }

  // People with no linked user account — the "Link to Person" combobox feed.
  async findUnlinked(): Promise<PersonDto[]> {
    const people = await this.peopleRepo.findUnlinked();
    return people.map((person) => this.toDto(person));
  }

  // Registers a citizen; a duplicate national number is a 409.
  async create(dto: CreatePersonRequestDto): Promise<PersonDto> {
    // Reject duplicates before inserting.
    const existing = await this.peopleRepo.findByNationalNumber(dto.nationalNumber);
    if (existing) {
      throw new ConflictException(
        `A person with National Number ${dto.nationalNumber} already exists`,
      );
    }

    const person = this.peopleRepo.create(dto);
    const saved = await this.peopleRepo.save(person);
    return this.toDto(saved);
  }

  // PATCH semantics: only the fields present in the body are applied; the
  // national number is re-checked for uniqueness, exempting the edited row.
  async update(id: number, dto: UpdatePersonRequestDto): Promise<PersonDto> {
    // 404 when the row doesn't exist.
    const person = await this.peopleRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Uniqueness guard only applies when the national number itself changes.
    if (dto.nationalNumber !== undefined) {
      const duplicate = await this.peopleRepo.findByNationalNumberExcluding(
        dto.nationalNumber,
        id,
      );
      if (duplicate) {
        throw new ConflictException(
          `A person with National Number ${dto.nationalNumber} already exists`,
        );
      }
    }

    // photoUrl is merged manually since null is a legitimate value (clearing the photo).
    const { photoUrl, ...rest } = dto;
    const merged = this.peopleRepo.merge(person, rest);
    if (photoUrl !== undefined) {
      merged.photoUrl = photoUrl;
    }
    const saved = await this.peopleRepo.save(merged);

    return this.toDto(saved);
  }

  // Hard delete; rows referenced by other tables surface as a 409 (FK violation).
  async remove(id: number): Promise<{ id: number }> {
    // 404 when the row doesn't exist.
    const person = await this.peopleRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    try {
      await this.peopleRepo.remove(person);
      return { id };
    } catch (error) {
      // FK violation (23503) = linked records exist; surface as a clean 409.
      if (error instanceof QueryFailedError && error.driverError?.code === '23503') {
        throw new ConflictException(
          'Cannot delete person: linked records exist (user account or other references)',
        );
      }
      throw error;
    }
  }
}