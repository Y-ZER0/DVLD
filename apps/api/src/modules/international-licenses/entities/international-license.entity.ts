import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from '../../local-license-applications/entities/application.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { License } from '../../licenses/entities/license.entity';

@Entity('InternationalLicenses')
export class InternationalLicense {
  @PrimaryGeneratedColumn({ name: 'InternationalLicenseID' })
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

  @ManyToOne(() => License, { nullable: false })
  @JoinColumn({ name: 'IssuedUsingLocalLicenseID' })
  issuedUsingLocalLicense: License;

  @Column({ name: 'IssuedUsingLocalLicenseID', unique: true })
  issuedUsingLocalLicenseId: number;

  @Column({ name: 'IssueDate', type: 'date' })
  issueDate: string;

  @Column({ name: 'ExpirationDate', type: 'date' })
  expirationDate: string;

  @Column({ name: 'IsActive' })
  isActive: boolean;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}