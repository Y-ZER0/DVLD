import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class ScheduleTestAppointmentRequestDto {
  @IsInt()
  @IsPositive()
  testTypeId: number;

  @IsDateString()
  appointmentDate: string;
}