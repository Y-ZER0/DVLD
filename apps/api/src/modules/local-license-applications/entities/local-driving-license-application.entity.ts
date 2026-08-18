import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { LicenseClass } from '../../lookup/entities/license-class.entity';

// LocalDrivingLicenseApplication — the kind-specific row this feature owns
// (build-plan.md § 4.1): strictly one-to-one with its Applications row
// (unique ApplicationID FK; the one-to-many side arrives with the Testing
// feature), and it names which LicenseClasses row is being applied for.
// The status/fees/dates live on the parent Applications row, not here.
// Same provenance as Application: created by the Supabase MCP migration
// `create_application_tables` — no TypeORM migration file exists.
@Entity('LocalDrivingLicenseApplications')
export class LocalDrivingLicenseApplication {
  @PrimaryGeneratedColumn({ name: 'LocalDrivingLicenseApplicationID' })
  id: number;

  // The parent application record — joined for status/fees/dates on every
  // return path. The DB's unique ApplicationID constraint enforces the
  // one-to-one structurally.
  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'ApplicationID' })
  application: Application;

  @Column({ name: 'ApplicationID', unique: true })
  applicationId: number;

  // The class being applied for — joined for className in list/detail;
  // the age gate reads MinimumAllowedAge through LookupService.
  @ManyToOne(() => LicenseClass, { nullable: false })
  @JoinColumn({ name: 'LicenseClassID' })
  licenseClass: LicenseClass;

  @Column({ name: 'LicenseClassID' })
  licenseClassId: number;
}