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

// PeopleService — the citizen registry's business rules (build-plan.md § 1.1).
// Layering per code-standards.md § 2: service owns every domain decision, the
// repository stays a pure data-access layer, and the entity never leaves the
// service — every return path projects through toDto() (invariant #11).
@Injectable()
export class PeopleService {
  constructor(private readonly peopleRepo: PeopleRepository) {}

  // Projects a Person entity into the shared PersonDto contract — the only
  // shape that ever crosses the API boundary (invariant #11). photoUrl is
  // normalized from nullable DB value to an absent optional field.
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

  // Paginated + filterable list for the People register screen — thin
  // pass-through of the repository result, projected field-by-field. The
  // return type is the DTO-shaped counterpart of the repository's
  // PaginatedPeople (which carries entities); meta is shared via its type.
  async findAll(
    params: FindAllPeopleParams,
  ): Promise<{ data: PersonDto[]; meta: PaginatedPeople['meta'] }> {
    // STEP 1: Fetch the page entities; the repository owns WHERE/ORDER/
    //         pagination so the count and the rows can never disagree.
    const { data, meta } = await this.peopleRepo.findAll(params);
    // STEP 2: Map every row across the toDto gate before returning — no
    //         entity leaves this service (invariant #11).
    return { data: data.map((person) => this.toDto(person)), meta };
  }

  // Single-record lookup for the detail/edit view; 404 if it doesn't exist.
  async findOne(id: number): Promise<PersonDto> {
    // STEP 1: Load the row first — we cannot answer for an id that isn't
    //         there, and 404 (rather than a later unhandled null) is the
    //         contract for a missing citizen record.
    const person = await this.peopleRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    return this.toDto(person);
  }

  // Every citizen still available to be linked to a login account — the
  // "Link to Person" combobox feed (build-plan.md § 2.1). Plain array,
  // not paginated: the combobox type-to-filters client-side over the
  // full unlinked set, so a page window would hide options.
  async findUnlinked(): Promise<PersonDto[]> {
    // STEP 1: The repository isolates the NOT EXISTS predicate; here we
    //         only project across the toDto gate (invariant #11).
    const people = await this.peopleRepo.findUnlinked();
    return people.map((person) => this.toDto(person));
  }

  // Registers a new citizen. Enforces format (DTO) then uniqueness
  // (service, invariant #25) — a duplicate is a 409 Conflict, never a 500.
  async create(dto: CreatePersonRequestDto): Promise<PersonDto> {
    // STEP 1: Check uniqueness BEFORE inserting — the DTO has already
    //         validated the N-######## format (cheap check first), so any
    //         row already carrying this National Number is a genuine
    //         duplicate and the response must say so (invariant #25).
    const existing = await this.peopleRepo.findByNationalNumber(dto.nationalNumber);
    if (existing) {
      throw new ConflictException(
        `A person with National Number ${dto.nationalNumber} already exists`,
      );
    }

    // STEP 2: Build the entity from the validated DTO — same property names
    //         as the entity, so the repository's create() materializes it
    //         directly. photoUrl is absent when not provided, keeping the
    //         nullable column NULL rather than an empty string.
    const person = this.peopleRepo.create(dto);
    const saved = await this.peopleRepo.save(person);

    // STEP 3: Return through the existing toDto gate so callers never see
    //         the raw entity.
    return this.toDto(saved);
  }

  // Partial update of an existing citizen (true PATCH semantics): only the
  // fields present in the body are validated (DTO) and applied, so a clerk
  // can fix a single phone number without re-submitting the whole record.
  // When the National Number itself is being changed, uniqueness is
  // re-verified with the edited row itself exempted.
  async update(id: number, dto: UpdatePersonRequestDto): Promise<PersonDto> {
    // STEP 1: Load the target row first — updating a record that doesn't
    //         exist is a 404, and we need the persisted entity to merge into.
    const person = await this.peopleRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // STEP 2: Re-run the uniqueness guard ONLY when the body actually
    //         changes the National Number (invariant #25 — validated on
    //         update too, but one's own value is never a conflict, and an
    //         edit touching other fields must not trip this check at all).
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

    // STEP 3: Merge only the fields the body actually carried onto the
    //         loaded entity and persist — the DTO instance only owns the
    //         keys the client sent, so omitted fields stay untouched (an
    //         empty PATCH is a harmless no-op returning the current row).
    //         photoUrl is merged manually because it may legitimately be
    //         null here (clearing the photo), which TypeORM's DeepPartial
    //         type rejects for a nullable string column.
    const { photoUrl, ...rest } = dto;
    const merged = this.peopleRepo.merge(person, rest);
    if (photoUrl !== undefined) {
      merged.photoUrl = photoUrl;
    }
    const saved = await this.peopleRepo.save(merged);

    return this.toDto(saved);
  }

  // Removes a citizen record. Hard delete (no soft-delete column exists in
  // the schema); a person referenced by Users/Drivers/Applications is
  // protected by the FK and surfaces as a 409, not a raw 500.
  async remove(id: number): Promise<{ id: number }> {
    // STEP 1: Confirm the row exists so a missing id is a clean 404 rather
    //         than an "affected 0 rows" ambiguity.
    const person = await this.peopleRepo.findById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    try {
      // STEP 2: Perform the delete inside the try so the FK-guard catch
      //         below can translate the DB error into a domain response.
      await this.peopleRepo.remove(person);
      return { id };
    } catch (error) {
      // STEP 3: Postgres raises foreign_key_violation (23503) when this
      //         Person is referenced by Users today and Drivers/Applications
      //         later — the same catch covers every future referencing table
      //         without this service knowing them (invariant #25 spirit: a
      //         registry row that other records hang off cannot silently
      //         disappear).
      if (error instanceof QueryFailedError && error.driverError?.code === '23503') {
        throw new ConflictException(
          'Cannot delete person: linked records exist (user account or other references)',
        );
      }
      throw error;
    }
  }
}