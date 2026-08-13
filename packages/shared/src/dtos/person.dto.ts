// Person contracts — the citizen registry root record projected to the
// client (architecture.md § schema, invariant #9: defined here and nowhere
// else). Deliberately flat and stored-only: a person's "Roles" are an
// inference from related User/Driver presence, never stored on Person —
// the 1.2 list screen's Roles column was DEFERRED (build-plan.md § 1.2)
// until Features 2 (Users) and 9 (Drivers) ship data for it.
import { Gender } from '../enums';

// A single citizen record as the API returns it. dateOfBirth stays the
// plain 'YYYY-MM-DD' string the date column carries; photoUrl is nullable
// in the DB and absent from the DTO when a person has no photo.
export interface PersonDto {
  id: number;
  nationalNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  photoUrl?: string;
  gender: Gender;
  address: string;
  phone: string;
  email: string;
  countryName: string;
}

// Meta block returned alongside paginated person lists (code-standards.md
// § 4 list envelope). The client can derive totalPages from total/pageSize.
export interface PaginatedResultDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}
