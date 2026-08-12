import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../../people/entities/person.entity';

// User — a system login identity. Every row is hard-linked to exactly one
// People row (architecture.md § Authentication & Core Patterns): there is
// no login without a citizen record behind it. Belongs to the users domain
// (Feature 2 builds the CRUD); auth reads it through UsersRepository.
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

  // select: false makes the hash invisible to every default query —
  // the only path that opts back in is the auth repository's explicit
  // addSelect (invariant #15). Never plaintext: bcrypt hash, cost 12.
  @Column({ name: 'Password', select: false })
  passwordHash: string;

  @Column({ name: 'IsActive' })
  isActive: boolean;
}