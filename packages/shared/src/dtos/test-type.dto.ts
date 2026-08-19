import type { TestType } from '../enums/test-type.enum';

export interface TestTypeDto {
  id: number;
  testTypeTitle: TestType;
  testTypeDescription: string;
  testTypeFees: string;
}