import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TestType } from '../../lookup/entities/test-type.entity';
import { LocalDrivingLicenseApplication } from '../../local-license-applications/entities/local-driving-license-application.entity';
import { Test } from './test.entity';

@Entity('TestAppointments')
export class TestAppointment {
  @PrimaryGeneratedColumn({ name: 'TestAppointmentID' })
  id: number;

  @ManyToOne(() => TestType, { nullable: false })
  @JoinColumn({ name: 'TestTypeID' })
  testType: TestType;

  @Column({ name: 'TestTypeID' })
  testTypeId: number;

  @ManyToOne(() => LocalDrivingLicenseApplication, { nullable: false })
  @JoinColumn({ name: 'LocalDrivingLicenseApplicationID' })
  lla: LocalDrivingLicenseApplication;

  @Column({ name: 'LocalDrivingLicenseApplicationID' })
  llaId: number;

  @Column({ name: 'AppointmentDate', type: 'timestamptz' })
  appointmentDate: Date;

  @Column({ name: 'PaidFees', type: 'decimal', precision: 10, scale: 2 })
  paidFees: string;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;

  @Column({ name: 'IsLocked' })
  isLocked: boolean;

  @OneToOne(() => Test, (test) => test.appointment, { nullable: true })
  test: Test | null;
}