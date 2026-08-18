import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TestType } from '../../lookup/entities/test-type.entity';
import { LocalDrivingLicenseApplication } from '../../local-license-applications/entities/local-driving-license-application.entity';
import { Test } from './test.entity';

// TestAppointment — a booked exam slot for exactly one test stage
// (build-plan.md § 5.1, architecture.md § schema): which stage (TestTypeID),
// which application (LocalDrivingLicenseApplicationID), when
// (AppointmentDate), and at what price the slot was booked (PaidFees —
// TestTypes.TestTypeFees snapshot at schedule time, invariant #28).
// IsLocked starts false and flips to true FOREVER the moment a Tests row is
// recorded against it (invariants #20/#21) — a locked appointment is an
// immutable audit fact, and a failed one cannot be reused, only replaced by
// a brand-new row.
// Created by the Supabase MCP migration `create_test_tables` (Session 14 —
// same user directive as the Session 11/12 tables: deliberately NOT a
// TypeORM migration file, so nothing replays on the next migration:run).
// The datetime column is timestamptz (Session 12 convention, unambiguous,
// native to TypeORM).
@Entity('TestAppointments')
export class TestAppointment {
  @PrimaryGeneratedColumn({ name: 'TestAppointmentID' })
  id: number;

  // The stage this slot is for — joined for testTypeTitle on history rows;
  // the fee snapshot reads TestTypes.TestTypeFees through LookupService
  // (never a foreign repository).
  @ManyToOne(() => TestType, { nullable: false })
  @JoinColumn({ name: 'TestTypeID' })
  testType: TestType;

  @Column({ name: 'TestTypeID' })
  testTypeId: number;

  // The application this slot belongs to — the pipeline reads group by it,
  // and the DB index on this column keeps those reads fast.
  @ManyToOne(() => LocalDrivingLicenseApplication, { nullable: false })
  @JoinColumn({ name: 'LocalDrivingLicenseApplicationID' })
  lla: LocalDrivingLicenseApplication;

  @Column({ name: 'LocalDrivingLicenseApplicationID' })
  llaId: number;

  @Column({ name: 'AppointmentDate', type: 'timestamptz' })
  appointmentDate: Date;

  // Snapshot of the stage fee taken at booking time (invariant #28) —
  // decimal-as-string like every fee field.
  @Column({ name: 'PaidFees', type: 'decimal', precision: 10, scale: 2 })
  paidFees: string;

  // The session user who booked the slot (invariant #29) — set from
  // @CurrentUser(), never from the request body.
  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;

  // false while the slot awaits its result; true permanently after the
  // result is recorded (invariant #20). The DB defaults it false — the
  // service is the only code that ever flips it.
  @Column({ name: 'IsLocked' })
  isLocked: boolean;

  // The recorded outcome, present only after the examiner writes a result
  // (invariant #20) — null while the slot is still open. Inverse side of
  // Test.appointment; the DB's unique TestAppointmentID enforces at most
  // one result per slot structurally.
  @OneToOne(() => Test, (test) => test.appointment, { nullable: true })
  test: Test | null;
}