import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const TEST_RESULT_VALUES = ['passed', 'failed'] as const;
export type TestResultValue = (typeof TEST_RESULT_VALUES)[number];

export class RecordTestResultRequestDto {
  @IsIn(TEST_RESULT_VALUES)
  result: TestResultValue;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}