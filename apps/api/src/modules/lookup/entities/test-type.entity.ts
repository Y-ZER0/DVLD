import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TestType as TestTypeEnum } from '@repo/shared';

@Entity('TestTypes')
export class TestType {
  @PrimaryGeneratedColumn({ name: 'TestTypeID' })
  id: number;

  @Column({
    name: 'TestTypeTitle',
    type: 'enum',
    enum: TestTypeEnum,
    enumName: 'test_type_enum',
  })
  testTypeTitle: TestTypeEnum;

  @Column({ name: 'TestTypeDescription' })
  testTypeDescription: string;

  @Column({ name: 'TestTypeFees', type: 'decimal', precision: 10, scale: 2 })
  testTypeFees: string;
}