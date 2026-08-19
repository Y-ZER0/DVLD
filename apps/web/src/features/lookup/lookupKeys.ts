export const lookupKeys = {
  all: () => ["lookup"] as const,
  licenseClasses: () => [...lookupKeys.all(), "license-classes"] as const,
  applicationTypes: () => [...lookupKeys.all(), "application-types"] as const,
  testTypes: () => [...lookupKeys.all(), "test-types"] as const,
}