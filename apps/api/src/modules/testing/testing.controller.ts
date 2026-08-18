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

// TestingController — the scheduling + results HTTP surface (build-plan.md
// § 5.1). Protected automatically by the global JwtAuthGuard — no @Public()
// anywhere (invariant #31). Controller stays thin per code-standards.md § 4:
// extract params/body/session → one service call → envelope, no branching.
// The application id rides the URL for scheduling (POST
// /test-appointments/:id) because the request DTO carries only the stage
// and date (build-plan.md § 5.1) — the client always schedules from the
// application's detail screen, so the id is in its URL already.
@Controller('test-appointments')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  // Pipeline state for one application — the detail page's right-hand
  // column: three ordered stages (Pending/Scheduled/Passed/Failed) + full
  // appointment history. 404 when the application id is unknown.
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

  // Books a slot for one stage of an application — 404 on an unknown
  // application or test type, 409 when the stage already has an open slot,
  // 409 when its predecessor hasn't passed (invariant #19), 409 on a
  // Cancelled/Completed application. The fee is snapshotted server-side
  // (invariant #28); the booking clerk comes from the session (invariant
  // #29), never the body.
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

  // Records the Pass/Fail verdict against one appointment and permanently
  // locks it — 404 on an unknown appointment, 409 when already locked
  // (invariant #20), 409 on a Cancelled/Completed application. The verdict
  // is written by the session user (invariant #29), never the body.
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