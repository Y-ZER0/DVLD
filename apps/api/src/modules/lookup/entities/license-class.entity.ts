import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LicenseClasses')
export class LicenseClass {
  @PrimaryGeneratedColumn({ name: 'LicenseClassID' })
  id: number;

  @Column({ name: 'ClassName' })
  className: string;

  @Column({ name: 'MinimumAllowedAge' })
  minimumAllowedAge: number;

  @Column({ name: 'DefaultValidityLength' })
  defaultValidityLength: number;

  @Column({ name: 'ClassFees', type: 'decimal', precision: 10, scale: 2 })
  classFees: string;
}