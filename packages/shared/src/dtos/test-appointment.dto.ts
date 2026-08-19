import type { TestType } from '../enums/test-type.enum';

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

export interface TestResultDto {
  id: number;
  result: boolean;
  notes: string | null;
}

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

export interface TestPipelineDto {
  applicationId: number;
  stages: TestStageDto[];
  history: TestAppointmentDto[];
}