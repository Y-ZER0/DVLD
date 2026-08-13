import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApplicationType as ApplicationTypeEnum } from '@repo/shared';

// ApplicationType — the ApplicationTypes configuration table (build-plan.md
// § 3.1, architecture.md § schema). Same provenance as LicenseClass: created
// + seeded by the Supabase MCP migration `create_lookup_tables_seed`, no
// TypeORM migration file. Read-only until Feature 11.
@Entity('ApplicationTypes')
export class ApplicationType {
  @PrimaryGeneratedColumn({ name: 'ApplicationTypeID' })
  id: number;

  // Enum column — exact Person.gender pattern (person.entity.ts): the shared
  // enum's string VALUES are the DB labels (application_type_enum). The
  // member name is aliased because the entity class itself shares the enum's
  // name.
  @Column({
    name: 'ApplicationTypeTitle',
    type: 'enum',
    enum: ApplicationTypeEnum,
    enumName: 'application_type_enum',
  })
  applicationTypeTitle: ApplicationTypeEnum;

  // Application-fee snapshot source (invariant #28) — decimal-as-string.
  @Column({ name: 'ApplicationFees', type: 'decimal', precision: 10, scale: 2 })
  applicationFees: string;
}