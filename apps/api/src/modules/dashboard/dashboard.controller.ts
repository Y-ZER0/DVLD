import { Controller, Get } from '@nestjs/common';
import { DashboardSummaryDto } from '@repo/shared';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary();
  }
}
