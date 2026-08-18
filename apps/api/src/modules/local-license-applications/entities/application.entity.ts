import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationStatus as ApplicationStatusEnum } from '@repo/shared';
import { Person } from '../../people/entities/person.entity';

// Application — the generic Applications table (architecture.md § schema):
// one row per application of ANY kind (new local license, renewal,
// replacement, release, international), shared by Features 4/7/8/9.
// Kind-specific rows (LocalDrivingLicenseApplications now, Licenses and
// DetainedLicenses later) hang off it via a unique ApplicationID FK.
// Created by the Supabase MCP migration `create_application_tables`
// (Session 12 — same user directive as the Session 11 lookup tables:
// deliberately NOT a TypeORM migration file, so nothing replays on the
// next migration:run).
// Session 12 deviation from the original DBML: ApplicationStatus is a
// Postgres enum `application_status_enum` (New/Cancelled/Completed), not
// the int 1:New/2:Cancelled/3:Completed — user directive, architecture.md
// updated to match. The datetime columns are timestamptz (unambiguous,
// handled natively by TypeORM as Date → ISO strings over JSON).
@Entity('Applications')
export class Application {
  @PrimaryGeneratedColumn({ name: 'ApplicationID' })
  id: number;

  // The applicant — joined for applicantName/nationalNumber on every
  // return path (same relation pattern as User.person).
  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'ApplicantPersonID' })
  person: Person;

  @Column({ name: 'ApplicantPersonID' })
  applicantPersonId: number;

  // When the application was filed — set by the service at create time.
  @Column({ name: 'ApplicationDate', type: 'timestamptz' })
  applicationDate: Date;

  // Plain FK column, deliberately no relation: the application-type lookup
  // belongs to the lookup domain, and fee reads go through LookupService
  // (architecture.md § System Boundaries — never a foreign repository).
  @Column({ name: 'ApplicationTypeID' })
  applicationTypeId: number;

  // PostgreSQL enum column — exact Person.gender / ApplicationType patterns
  // (shared enum's string VALUES are the DB labels).
  @Column({
    name: 'ApplicationStatus',
    type: 'enum',
    enum: ApplicationStatusEnum,
    enumName: 'application_status_enum',
  })
  applicationStatus: ApplicationStatusEnum;

  // Mirrors ApplicationDate on create; updated on every status change
  // (cancellation now, completion at Feature 6 issuance).
  @Column({ name: 'LastStatusDate', type: 'timestamptz' })
  lastStatusDate: Date;

  // Snapshot of ApplicationTypes.ApplicationFees taken at create time
  // (invariant #28) — decimal-as-string like every fee field.
  @Column({ name: 'PaidFees', type: 'decimal', precision: 10, scale: 2 })
  paidFees: string;

  // The session user who filed the application (invariant #29) — set
  // from @CurrentUser(), never from the request body.
  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}