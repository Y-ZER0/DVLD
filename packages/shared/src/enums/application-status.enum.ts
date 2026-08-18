// ApplicationStatus enum — values mirror the postgres application_status_enum
// labels exactly (architecture.md § Data Flow & Database Schema): the DB
// stores the string labels, so the TS value of each member IS the persisted
// string. Session 12 decision: the Applications.ApplicationStatus column is a
// Postgres enum — NOT the int (1:New, 2:Cancelled, 3:Completed) from the
// original DBML — user directive, documented in the entity header and
// architecture.md. Completed is set by Feature 6 (issuance) only.
export enum ApplicationStatus {
  NEW = 'New',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
}
