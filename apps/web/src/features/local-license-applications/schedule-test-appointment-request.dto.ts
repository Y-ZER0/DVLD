// ScheduleTestAppointmentRequestDto — frontend request shape for POST
// /test-appointments/:id (Feature 5.2). Plain interface only (invariant #8:
// validation is the backend's job — 5.1's class-validator DTO enforces
// shape server-side). testTypeId selects the stage being booked; the
// appointmentDate is the ISO date string from the native date input. The
// fee is never sent from the client — the backend snapshots it from
// TestTypes.TestTypeFees at booking time (invariant #28).

export interface ScheduleTestAppointmentRequestDto {
  testTypeId: number
  appointmentDate: string
}