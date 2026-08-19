import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IssueReason } from '@repo/shared';
import { Application } from '../../local-license-applications/entities/application.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { LicenseClass } from '../../lookup/entities/license-class.entity';

// License — the issued artifact of a completed local driving license
// application (build-plan.md § 6.1, architecture.md § schema): which
// application it completes (unique ApplicationID — one license per
// application, structurally), which driver holds it (Drivers row created
// in the SAME transaction when absent, invariant #23), which class, the
// validity window (IssueDate + LicenseClasses.DefaultValidityLength,
// library-docs.md § 8), the ClassFees snapshot at issue time
// (PaidFees, invariant #28), and why it exists (IssueReason int per the
// DBML note '1:FirstTime, 2:Renew, 3:Replacement(Damaged),
// 4:Replacement(Lost)' — shared IssueReason enum mirrors those values).
// IsActive starts true; Feature 7 deactivates the prior row on
// renewal/replacement (invariant #26) — a driver may never hold two live
// licenses of the same class.
// Created by the Supabase MCP migration `create_drivers_licenses_tables`
// (Session 16 — deliberately NOT a TypeORM migration file, Session
// 11/12/14 precedent). The date columns are `date` (TypeORM returns
// 'YYYY-MM-DD' strings, Person.dateOfBirth pattern).
@Entity('Licenses')
export class License {
  @PrimaryGeneratedColumn({ name: 'LicenseID' })
  id: number;

  // The application row this license completed. One-to-one side of the
  // application's child-key pattern — the DB's unique ApplicationID
  // enforces at most one license per application structurally (this is
  // also what makes a concurrent double-issue of one application fail
  // instead of producing two licenses).
  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'ApplicationID' })
  application: Application;

  @Column({ name: 'ApplicationID', unique: true })
  applicationId: number;

  // The driver holding the license — joined for driverName/nationalNumber
  // on every return path. The Drivers row is created in the same
  // transaction when the person has none (invariant #23).
  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'DriverID' })
  driver: Driver;

  @Column({ name: 'DriverID' })
  driverId: number;

  // The class this license covers — joined for className; the fee and
  // validity values were read from the same row at issue time through
  // LookupService (never a foreign repository).
  @ManyToOne(() => LicenseClass, { nullable: false })
  @JoinColumn({ name: 'LicenseClassID' })
  licenseClass: LicenseClass;

  @Column({ name: 'LicenseClassID' })
  licenseClassId: number;

  // The validity window (library-docs.md § 8): IssueDate is the issue day,
  // ExpirationDate = IssueDate + DefaultValidityLength years — computed in
  // the service, never accepted from the client.
  @Column({ name: 'IssueDate', type: 'date' })
  issueDate: string;

  @Column({ name: 'ExpirationDate', type: 'date' })
  expirationDate: string;

  // Clerk's free text from the issue modal (optional). Explicit varchar
  // type: TS reflection emits Object for a `string | null` union
  // (Person.photoUrl precedent, Session 9 RECOVER).
  @Column({ name: 'Notes', type: 'varchar', nullable: true })
  notes: string | null;

  // Snapshot of LicenseClasses.ClassFees taken at issue time (invariant
  // #28) — decimal-as-string like every fee field, display-only
  // client-side.
  @Column({ name: 'PaidFees', type: 'decimal', precision: 10, scale: 2 })
  paidFees: string;

  // true while the license is in good standing. Feature 7 sets the prior
  // row to false when renewing/replacing (invariant #26) — never deleted.
  @Column({ name: 'IsActive' })
  isActive: boolean;

  // Why this license exists — int column per the architecture.md DBML
  // note; the shared IssueReason enum mirrors the 1-4 vocabulary.
  @Column({ name: 'IssueReason', type: 'int' })
  issueReason: IssueReason;

  // The session user who issued the license (invariant #29) — set from
  // @CurrentUser(), never from the request body.
  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}