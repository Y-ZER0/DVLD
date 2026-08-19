import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../../people/entities/person.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn({ name: 'UserID' })
  id: number;

  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'PersonID' })
  person: Person;

  @Column({ name: 'PersonID' })
  personId: number;

  @Column({ name: 'Username', unique: true })
  username: string;

  @Column({ name: 'Password', select: false })
  passwordHash: string;

  @Column({ name: 'IsActive' })
  isActive: boolean;
}