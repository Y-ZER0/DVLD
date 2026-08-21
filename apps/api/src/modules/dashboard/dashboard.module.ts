import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../local-license-applications/entities/application.entity';
import { TestAppointment } from '../testing/entities/test-appointment.entity';
import { License } from '../licenses/entities/license.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { DetainedLicense } from '../detain-release/entities/detained-license.entity';
import { ApplicationType } from '../lookup/entities/application-type.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      TestAppointment,
      License,
      Driver,
      DetainedLicense,
      ApplicationType,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
