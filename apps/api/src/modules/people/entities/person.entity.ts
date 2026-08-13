import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from '@repo/shared';

// Person — the citizen registry root record (architecture.md § schema).
// Every other entity (Users, Drivers, Applications) points back at a
// People row. Created here during 0.B as schema-only (no CRUD yet —
// Feature 1 adds the repository/service/controller), because the auth
// seed and the login response's personId/fullName depend on the table
// existing. Column names mirror the DBML exactly.
@Entity('People')
export class Person {
  @PrimaryGeneratedColumn({ name: 'PersonID' })
  id: number;

  // Validation of format + uniqueness is Feature 1's concern (invariant
  // #25) — the column just carries the value here.
  @Column({ name: 'NationalNumber', unique: true })
  nationalNumber: string;

  @Column({ name: 'FirstName' })
  firstName: string;

  @Column({ name: 'LastName' })
  lastName: string;

  @Column({ name: 'DateOfBirth', type: 'date' })
  dateOfBirth: string;

  // Nullable column (photo upload is out of scope; the field carries an
  // optional URL). null = explicitly no photo. Explicit varchar type:
  // TS reflection emits `Object` for a `string | null` union, which
  // TypeORM's metadata validator rejects at boot/migration time.
  @Column({ name: 'PhotoUrl', type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'Gender', type: 'enum', enum: Gender, enumName: 'gender_enum' })
  gender: Gender;

  @Column({ name: 'Address' })
  address: string;

  @Column({ name: 'Phone' })
  phone: string;

  @Column({ name: 'Email' })
  email: string;

  @Column({ name: 'CountryName' })
  countryName: string;
}