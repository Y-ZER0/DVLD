export const renewalsReplacementKeys = {
  all: () => ["renewals-replacements"] as const,
  lists: () => [...renewalsReplacementKeys.all(), "list"] as const,
  list: (params?: { page?: number; pageSize?: number }) =>
    [...renewalsReplacementKeys.lists(), { params }] as const,
}