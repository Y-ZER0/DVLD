import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// LicenseClass — the LicenseClasses configuration table (build-plan.md § 3.1,
// architecture.md § schema). The table + its 7 seed rows were created by the
// Supabase MCP migration `create_lookup_tables_seed` (Session 11 user
// directive — deliberately NOT a TypeORM migration, so no migration file
// exists to replay). Read-only until Feature 11 adds the configuration
// PATCH endpoints.
@Entity('LicenseClasses')
export class LicenseClass {
  @PrimaryGeneratedColumn({ name: 'LicenseClassID' })
  id: number;

  @Column({ name: 'ClassName' })
  className: string;

  // Minimum age a citizen must reach before applying for this class —
  // Feature 4.1 verifies the applicant against this at transaction time
  // (library-docs.md § 2), never against a client-sent value.
  @Column({ name: 'MinimumAllowedAge' })
  minimumAllowedAge: number;

  // Years a freshly issued license of this class stays valid; Feature 6.1
  // computes ExpirationDate = IssueDate + this (library-docs.md § 8).
  @Column({ name: 'DefaultValidityLength' })
  defaultValidityLength: number;

  // Current issuance-fee snapshot source (invariant #28). Decimal column —
  // TypeORM returns it as a string; the DTO carries it through unchanged.
  @Column({ name: 'ClassFees', type: 'decimal', precision: 10, scale: 2 })
  classFees: string;
}