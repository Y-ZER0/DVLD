import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TestType as TestTypeEnum } from '@repo/shared';

// TestType — the TestTypes configuration table (build-plan.md § 3.1,
// architecture.md § schema). Same provenance as LicenseClass: created +
// seeded by the Supabase MCP migration `create_lookup_tables_seed`, no
// TypeORM migration file. Read-only until Feature 11.
@Entity('TestTypes')
export class TestType {
  @PrimaryGeneratedColumn({ name: 'TestTypeID' })
  id: number;

  // Enum column — Vision/Written/Street labels (test_type_enum), the
  // system's enforced test sequence (invariant #19). Member name aliased:
  // the entity class shares the enum's name.
  @Column({
    name: 'TestTypeTitle',
    type: 'enum',
    enum: TestTypeEnum,
    enumName: 'test_type_enum',
  })
  testTypeTitle: TestTypeEnum;

  // Human-readable one-liner shown next to the fee in the Test Pipeline UI
  // (Feature 5.2). Seed descriptions are provisional until the requirements
  // file surfaces (Session 11 note).
  @Column({ name: 'TestTypeDescription' })
  testTypeDescription: string;

  // Test-fee snapshot source (invariant #28) — decimal-as-string.
  @Column({ name: 'TestTypeFees', type: 'decimal', precision: 10, scale: 2 })
  testTypeFees: string;
}