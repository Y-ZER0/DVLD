import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from '@repo/shared';

@Entity('People')
export class Person {
  @PrimaryGeneratedColumn({ name: 'PersonID' })
  id: number;

  @Column({ name: 'NationalNumber', unique: true })
  nationalNumber: string;

  @Column({ name: 'FirstName' })
  firstName: string;

  @Column({ name: 'LastName' })
  lastName: string;

  @Column({ name: 'DateOfBirth', type: 'date' })
  dateOfBirth: string;

  @Column({ name: 'PhotoUrl', type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'Gender', type: 'enum', enum: Gender, enumName: 'gender_enum' })
  gender: Gender;

  @Column({ name: 'Address' })
  address: string;

  @Column({ name: 'Phone' })
  phone: string;

  @Column({ name: 'Email' })
  email: string;

  @Column({ name: 'CountryName' })
  countryName: string;
}