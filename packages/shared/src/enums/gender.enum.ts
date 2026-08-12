// Gender enum — values mirror the postgres gender_enum labels exactly
// (architecture.md § Data Flow & Database Schema): the DB stores the string
// labels, so the TS value of each member IS the persisted string.
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}