import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../../people/entities/person.entity';

// Driver — the person-as-license-holder record (architecture.md § schema):
// one row per person (unique PersonID — a person is a driver at most
// once), created the first time a license is issued to them (invariant
// #23, Feature 6.1) inside the same transaction as the Licenses insert.
// CreatedByUserID is the acting session user (invariant #29); CreatedDate
// is the same instant — together they answer "licensed since when, by
// whom" without any join.
// Created by the Supabase MCP migration `create_drivers_licenses_tables`
// (Session 16 — same user directive as the Session 11/12/14 tables:
// deliberately NOT a TypeORM migration file, so nothing replays on the
// next migration:run). The datetime column is timestamptz (Session 12
// convention, unambiguous, native to TypeORM).
@Entity('Drivers')
export class Driver {
  @PrimaryGeneratedColumn({ name: 'DriverID' })
  id: number;

  // The citizen behind this driver profile — joined for name/national
  // number on every future history read (same relation pattern as
  // User.person). The DB's unique PersonID is the structural guarantee
  // that no person ever gets two Drivers rows.
  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'PersonID' })
  person: Person;

  @Column({ name: 'PersonID', unique: true })
  personId: number;

  // Who registered this person as a driver — set from @CurrentUser(),
  // never from the request body (invariant #29).
  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;

  // When the driver record was created — the moment of first issuance.
  @Column({ name: 'CreatedDate', type: 'timestamptz' })
  createdDate: Date;
}