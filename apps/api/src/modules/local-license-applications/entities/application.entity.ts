import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationStatus as ApplicationStatusEnum } from '@repo/shared';
import { Person } from '../../people/entities/person.entity';

@Entity('Applications')
export class Application {
  @PrimaryGeneratedColumn({ name: 'ApplicationID' })
  id: number;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'ApplicantPersonID' })
  person: Person;

  @Column({ name: 'ApplicantPersonID' })
  applicantPersonId: number;

  @Column({ name: 'ApplicationDate', type: 'timestamptz' })
  applicationDate: Date;

  @Column({ name: 'ApplicationTypeID' })
  applicationTypeId: number;

  @Column({
    name: 'ApplicationStatus',
    type: 'enum',
    enum: ApplicationStatusEnum,
    enumName: 'application_status_enum',
  })
  applicationStatus: ApplicationStatusEnum;

  @Column({ name: 'LastStatusDate', type: 'timestamptz' })
  lastStatusDate: Date;

  @Column({ name: 'PaidFees', type: 'decimal', precision: 10, scale: 2 })
  paidFees: string;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;
}