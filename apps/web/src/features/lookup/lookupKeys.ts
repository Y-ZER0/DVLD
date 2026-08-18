// lookupKeys — TanStack Query key factory for the lookup domain
// (library-docs.md § 4: identical shape for every feature; never write a
// raw inline array in a useQuery call — invariant #5). License classes,
// application types, and test types are the three registers the UI
// consumes (class minimum ages, the NewDrivingLicense fee notice, the 5.2
// test-stage fees); Feature 11.2 later patches all three. Each register is
// one branch: full-array feeds consumed by dropdowns and fee notices,
// invalidated wholesale whenever Feature 11's PATCH edits a row.

export const lookupKeys = {
  all: () => ["lookup"] as const,
  licenseClasses: () => [...lookupKeys.all(), "license-classes"] as const,
  applicationTypes: () => [...lookupKeys.all(), "application-types"] as const,
  testTypes: () => [...lookupKeys.all(), "test-types"] as const,
}