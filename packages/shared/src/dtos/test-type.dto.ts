// TestType contracts — the TestTypes lookup table projected to the client
// (architecture.md § schema, invariant #9). testTypeTitle is the enum label
// (Vision/Written/Street — the enforced test order, invariant #19);
// testTypeFees follows the decimal-as-string fee convention.
import type { TestType } from '../enums/test-type.enum';

// A single test type row as the API returns it. testTypeDescription is the
// human-readable one-liner shown next to the fee (e.g. the TestPipelineCard).
export interface TestTypeDto {
  id: number;
  testTypeTitle: TestType;
  testTypeDescription: string;
  testTypeFees: string;
}