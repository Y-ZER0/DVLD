import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApplicationType as ApplicationTypeEnum } from '@repo/shared';

@Entity('ApplicationTypes')
export class ApplicationType {
  @PrimaryGeneratedColumn({ name: 'ApplicationTypeID' })
  id: number;

  @Column({
    name: 'ApplicationTypeTitle',
    type: 'enum',
    enum: ApplicationTypeEnum,
    enumName: 'application_type_enum',
  })
  applicationTypeTitle: ApplicationTypeEnum;

  @Column({ name: 'ApplicationFees', type: 'decimal', precision: 10, scale: 2 })
  applicationFees: string;
}