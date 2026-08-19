import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TestAppointment } from './test-appointment.entity';

@Entity('Tests')
export class Test {
  @PrimaryGeneratedColumn({ name: 'TestID' })
  id: number;

  @OneToOne(() => TestAppointment, { nullable: false })
  @JoinColumn({ name: 'TestAppointmentID' })
  appointment: TestAppointment;

  @Column({ name: 'TestAppointmentID', unique: true })
  appointmentId: number;

  @Column({ name: 'TestResult' })
  testResult: boolean;

  @Column({ name: 'Notes', type: 'varchar', nullable: true })
  notes: string | null;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}