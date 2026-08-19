import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../../people/entities/person.entity';

@Entity('Drivers')
export class Driver {
  @PrimaryGeneratedColumn({ name: 'DriverID' })
  id: number;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'PersonID' })
  person: Person;

  @Column({ name: 'PersonID', unique: true })
  personId: number;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;

  @Column({ name: 'CreatedDate', type: 'timestamptz' })
  createdDate: Date;
}