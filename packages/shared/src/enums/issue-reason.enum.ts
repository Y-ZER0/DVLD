// IssueReason enum — why a Licenses row exists (architecture.md § schema
// DBML note: '1:FirstTime, 2:Renew, 3:Replacement(Damaged),
// 4:Replacement(Lost)'). The Licenses.IssueReason column is a plain int
// mirroring these values (the note is the contract — unlike ApplicationStatus,
// Session 12 set no user directive to convert this column to a Postgres
// enum, so the DBML's int stands). Feature 6.1 writes FIRST_TIME; Features
// 7/8 write the rest.
export enum IssueReason {
  FIRST_TIME = 1,
  RENEW = 2,
  REPLACEMENT_DAMAGED = 3,
  REPLACEMENT_LOST = 4,
}