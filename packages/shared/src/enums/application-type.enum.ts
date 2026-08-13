// ApplicationType enum — values mirror the postgres application_type_enum
// labels exactly (architecture.md § Data Flow & Database Schema): the DB
// stores the string labels, so the TS value of each member IS the persisted
// string. NewDrivingLicense is the application kind Feature 4 creates; the
// other five back renewals, replacements, release and the international
// service (Features 7-9).
export enum ApplicationType {
  NEW_DRIVING_LICENSE = 'NewDrivingLicense',
  RENEW_DRIVING_LICENSE = 'RenewDrivingLicense',
  REPLACEMENT_FOR_DAMAGED_LICENSE = 'ReplacementForDamagedLicense',
  REPLACEMENT_FOR_LOST_LICENSE = 'ReplacementForLostLicense',
  RELEASE_DETAINED_LICENSE = 'ReleaseDetainedLicense',
  NEW_INTERNATIONAL_LICENSE = 'NewInternationalLicense',
}