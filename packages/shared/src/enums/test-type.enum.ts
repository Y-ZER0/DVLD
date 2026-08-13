// TestType enum — values mirror the postgres test_type_enum labels exactly
// (architecture.md § Data Flow & Database Schema): the DB stores the string
// labels, so the TS value of each member IS the persisted string. The member
// order (Vision → Written → Street) is the system's enforced test sequence
// (invariant #19).
export enum TestType {
  VISION = 'Vision',
  WRITTEN = 'Written',
  STREET = 'Street',
}