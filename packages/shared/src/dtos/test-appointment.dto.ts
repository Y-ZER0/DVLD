// Test Appointment & Results contracts (build-plan.md § 5.1). The
// TestAppointments row is a booked slot for exactly one test stage of a
// local driving license application; the nested test is the recorded
// Pass/Fail outcome, present only after the examiner records a result
// (invariant #20 — that write permanently locks the appointment).
// Invariant #9: defined here and nowhere else.
import type { TestType } from '../enums/test-type.enum';

// A single appointment as the API returns it. paidFees is the
// TestTypes.TestTypeFees snapshot taken at schedule time (invariant #28) —
// decimal-as-string, display-only client-side. isLocked is true forever
// once a result has been recorded. test is null while the slot is still
// waiting to be taken.
export interface TestAppointmentDto {
  id: number;
  testTypeId: number;
  testTypeTitle: TestType;
  localDrivingLicenseApplicationId: number;
  appointmentDate: string;
  paidFees: string;
  isLocked: boolean;
  test: TestResultDto | null;
}

// The recorded outcome of one appointment: result true = Passed, false =
// Failed (invariant #21 — a failed attempt is permanent and requires a
// brand-new appointment for the same stage). notes is the examiner's free
// text from the record-result modal.
export interface TestResultDto {
  id: number;
  result: boolean;
  notes: string | null;
}

// Derived per-stage state for the Test Pipeline stepper (build-plan.md
// § 5.2). EXACTLY four states (Session 14 user spec — there is no
// Pending/Failed on the stages section; a failed attempt never appears as
// its own stage state, it just keeps the stage on 'Schedule' until it
// passes, with the attempt count read from history):
//   Passed    — the stage has a recorded `true` result (previous stages);
//               once passed, a stage stays passed forever
//   Schedule  — the CURRENT stage (first not-yet-passed one) with no open
//               booking — the UI renders its white card + Schedule button
//   Scheduled — the CURRENT stage with an open (unlocked) booking — the UI
//               renders the amber "Scheduled <date>" pill + Record Result
//               button; appointmentDate/paidFees/appointmentId are live
//   Locked    — every stage BEYOND the current one: unreachable until the
//               predecessor passes — the UI renders it grayed with a lock
//               icon and everything disabled
// appointment* fields always reflect the stage's LATEST appointment row.
export type TestStageStatus = 'Passed' | 'Schedule' | 'Scheduled' | 'Locked';

export interface TestStageDto {
  testTypeId: number;
  title: TestType;
  description: string;
  status: TestStageStatus;
  appointmentId: number | null;
  appointmentDate: string | null;
  paidFees: string | null;
  testResult: boolean | null;
  notes: string | null;
}

// The single payload behind the detail page's right-hand column
// (build-plan.md § 5.2): exactly three stages in Vision → Written → Street
// order (invariant #19), plus the full appointment history for the
// AppointmentHistoryList — every appointment, newest first, with its
// result + lock flag and the fee snapshot at booking time.
export interface TestPipelineDto {
  applicationId: number;
  stages: TestStageDto[];
  history: TestAppointmentDto[];
}