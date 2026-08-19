import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TestAppointmentDto, TestPipelineDto } from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TestingService } from './testing.service';
import { ScheduleTestAppointmentRequestDto } from './dtos/schedule-test-appointment-request.dto';
import { RecordTestResultRequestDto } from './dtos/record-test-result-request.dto';

@Controller('test-appointments')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Get('pipeline/:localDrivingLicenseApplicationId')
  async getPipeline(
    @Param('localDrivingLicenseApplicationId', ParseIntPipe)
    localDrivingLicenseApplicationId: number,
  ): Promise<{ success: true; data: TestPipelineDto }> {
    const data = await this.testingService.getPipeline(
      localDrivingLicenseApplicationId,
    );
    return { success: true, data };
  }

  @Post(':localDrivingLicenseApplicationId')
  async schedule(
    @Param('localDrivingLicenseApplicationId', ParseIntPipe)
    localDrivingLicenseApplicationId: number,
    @Body() dto: ScheduleTestAppointmentRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: TestAppointmentDto }> {
    const data = await this.testingService.schedule(
      localDrivingLicenseApplicationId,
      dto,
      user.userId,
    );
    return { success: true, data };
  }

  @Patch(':id/result')
  async recordResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordTestResultRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: TestAppointmentDto }> {
    const data = await this.testingService.recordResult(id, dto, user.userId);
    return { success: true, data };
  }
}