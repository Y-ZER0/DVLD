import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { License } from '../../licenses/entities/license.entity';

@Entity('DetainedLicenses')
export class DetainedLicense {
  @PrimaryGeneratedColumn({ name: 'DetainID' })
  id: number;

  @ManyToOne(() => License, { nullable: false })
  @JoinColumn({ name: 'LicenseID' })
  license: License;

  @Column({ name: 'LicenseID' })
  licenseId: number;

  @Column({ name: 'DetainDate', type: 'timestamptz' })
  detainDate: Date;

  @Column({ name: 'FineFees', type: 'decimal', precision: 10, scale: 2 })
  fineFees: string;

  @Column({ name: 'CreatedByUserID' })
  createdByUserId: number;

  @Column({ name: 'IsReleased' })
  isReleased: boolean;

  @Column({ name: 'ReleaseDate', type: 'timestamptz', nullable: true })
  releaseDate: Date | null;

  @Column({ name: 'ReleasedByUserID', nullable: true })
  releasedByUserId: number | null;

  @Column({ name: 'ReleaseApplicationID', nullable: true })
  releaseApplicationId: number | null;
}
