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

@Entity('Licenses')
export class License {
  @PrimaryGeneratedColumn({ name: 'LicenseID' })
  id: number;

  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'ApplicationID' })
  application: Application;

  @Column({ name: 'ApplicationID', unique: true })
  applicationId: number;

  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'DriverID' })
  driver: Driver;

  @Column({ name: 'DriverID' })
  driverId: number;

  @ManyToOne(() => LicenseClass, { nullable: false })
  @JoinColumn({ name: 'LicenseClassID' })
  licenseClass: LicenseClass;

  @Column({ name: 'LicenseClassID' })
  licenseClassId: number;

  @Column({ name: 'IssueDate', type: 'date' })
  issueDate: string;

  @Column({ name: 'ExpirationDate', type: 'date' })
  expirationDate: string;

  @Column({ name: 'Notes', type: 'varchar', nullable: true })
  notes: string | null;

  @Column({ name: 'PaidFees', type: 'decimal', precision: 10, scale: 2 })
  paidFees: string;

  @Column({ name: 'IsActive' })
  isActive: boolean;

  @Column({ name: 'IssueReason', type: 'int' })
  issueReason: IssueReason;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}