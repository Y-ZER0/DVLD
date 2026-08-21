import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { License } from '../licenses/entities/license.entity';
import { InternationalLicense } from '../international-licenses/entities/international-license.entity';
import { TestAppointment } from '../testing/entities/test-appointment.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversRepository } from './repositories/drivers.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, License, InternationalLicense, TestAppointment]),
  ],
  controllers: [DriversController],
  providers: [DriversService, DriversRepository],
  exports: [DriversService],
})
export class DriversModule {}