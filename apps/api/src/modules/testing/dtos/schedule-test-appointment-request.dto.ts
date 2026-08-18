import { IsDateString, IsInt, IsPositive } from 'class-validator';

// ScheduleTestAppointmentRequestDto — payload for POST
// /test-appointments (build-plan.md § 5.1). The sequencing rules (stage
// order, predecessor gate, invariant #19) cannot live here: the requested
// stage's position is resolved against the application's existing test
// history in the service. The fee is never accepted from the client — it
// is snapshotted server-side from TestTypes.TestTypeFees at booking time
// (invariant #28).
export class ScheduleTestAppointmentRequestDto {
  // STEP 1: testTypeId — the stage being booked (Vision/Written/Street).
  //         The service resolves it (404 if unknown) and runs the
  //         predecessor gate against it.
  @IsInt()
  @IsPositive()
  testTypeId: number;

  // STEP 2: appointmentDate — when the slot is booked for. ISO-8601
  //         string; stored as timestamptz.
  @IsDateString()
  appointmentDate: string;
}