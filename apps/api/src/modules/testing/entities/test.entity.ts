import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TestAppointment } from './test-appointment.entity';

// Test — the recorded outcome of one test appointment (build-plan.md § 5.1,
// architecture.md § schema): exactly one row per appointment (unique
// TestAppointmentID — a slot can never hold two results). TestResult is the
// Pass (true) / Fail (false) verdict; Notes is the examiner's free text.
// Writing this row is the irreversible act: the service flips the
// appointment's IsLocked in the SAME transaction (invariants #20/#21), so
// this table is an append-only audit log forever.
// Created by the Supabase MCP migration `create_test_tables` (Session 14) —
// deliberately NOT a TypeORM migration file (Session 11/12 precedent).
@Entity('Tests')
export class Test {
  @PrimaryGeneratedColumn({ name: 'TestID' })
  id: number;

  // The slot this verdict belongs to. One-to-one owning side: the DB's
  // UNIQUE constraint on TestAppointmentID is the structural guarantee that
  // a second result cannot be written against the same appointment, on top
  // of the service's IsLocked guard (invariant #20).
  @OneToOne(() => TestAppointment, { nullable: false })
  @JoinColumn({ name: 'TestAppointmentID' })
  appointment: TestAppointment;

  @Column({ name: 'TestAppointmentID', unique: true })
  appointmentId: number;

  // true = Passed (advances the pipeline, invariant #19), false = Failed
  // (permanent, requires a brand-new appointment for the same stage,
  // invariant #21).
  @Column({ name: 'TestResult' })
  testResult: boolean;

  @Column({ name: 'Notes', type: 'varchar', nullable: true })
  notes: string | null;

  // The session user who recorded the verdict (invariant #29) — set from
  // @CurrentUser(), never from the request body.
  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}