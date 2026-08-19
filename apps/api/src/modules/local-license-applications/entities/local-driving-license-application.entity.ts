import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { LicenseClass } from '../../lookup/entities/license-class.entity';

@Entity('LocalDrivingLicenseApplications')
export class LocalDrivingLicenseApplication {
  @PrimaryGeneratedColumn({ name: 'LocalDrivingLicenseApplicationID' })
  id: number;

  @ManyToOne(() => Application, { nullable: false })
  @JoinColumn({ name: 'ApplicationID' })
  application: Application;

  @Column({ name: 'ApplicationID', unique: true })
  applicationId: number;

  @ManyToOne(() => LicenseClass, { nullable: false })
  @JoinColumn({ name: 'LicenseClassID' })
  licenseClass: LicenseClass;

  @Column({ name: 'LicenseClassID' })
  licenseClassId: number;
}