// Contract barrel for the whole system: every shared response shape (*Dto)
// and every enum lives here and nowhere else (architecture.md § shared package,
// invariant #9). The folder behind this barrel is intentionally empty at
// scaffold time — DTOs and enums arrive with their owning features.
export * from './dtos';
export * from './enums';