import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApplicationStatus, LocalDrivingLicenseApplicationDto } from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { LocalLicenseApplicationsService } from './local-license-applications.service';
import { CreateLocalLicenseApplicationRequestDto } from './dtos/create-local-license-application-request.dto';
import { PaginatedLocalLicenseApplications } from './repositories/local-license-applications.repository';

// LocalLicenseApplicationsController — the applications domain's HTTP
// surface (build-plan.md § 4.1). Protected automatically by the global
// JwtAuthGuard — no @Public() anywhere (invariant #31). Controller stays
// thin per code-standards.md § 4: extract params/body/session → one
// service call → envelope, no branching.
@Controller('local-license-applications')
export class LocalLicenseApplicationsController {
  constructor(
    private readonly localLicenseApplicationsService: LocalLicenseApplicationsService,
  ) {}

  // Paginated application register for the 4.2 list screen: page/pageSize
  // window, optional free-text search (applicant name/national number),
  // optional exact status filter — same envelope contract as GET /people
  // and GET /users. Defaults: page 1, pageSize 10.
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
    @Query('status', new ParseEnumPipe(ApplicationStatus, { optional: true }))
    status?: ApplicationStatus,
  ): Promise<{
    success: true;
    data: LocalDrivingLicenseApplicationDto[];
    meta: PaginatedLocalLicenseApplications['meta'];
  }> {
    // STEP 1: The service owns filtering + projection; the controller only
    //         shapes the list envelope.
    const { data, meta } = await this.localLicenseApplicationsService.findAll({
      page,
      pageSize,
      search,
      status,
    });
    return { success: true, data, meta };
  }

  // Files a new local driving license application — 404 when the person or
  // class doesn't exist, 400 when the applicant is underage, 400 on a
  // malformed payload (global ValidationPipe). The fee is snapshotted
  // server-side (invariant #28); the filing user comes from the session
  // (invariant #29), never the body.
  @Post()
  async create(
    @Body() dto: CreateLocalLicenseApplicationRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: LocalDrivingLicenseApplicationDto }> {
    const data = await this.localLicenseApplicationsService.create(dto, user.userId);
    return { success: true, data };
  }

  // Single application for the 4.2 detail screen — applicant summary,
  // class, status, snapshotted fee, dates. 404 when the id is unknown.
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: LocalDrivingLicenseApplicationDto }> {
    const data = await this.localLicenseApplicationsService.findOne(id);
    return { success: true, data };
  }

  // Cancels a New application — 409 when the application is already
  // Cancelled or Completed (one-way door). LastStatusDate is stamped
  // server-side as part of the transition.
  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number  )
    : Promise<{ success: true; data: LocalDrivingLicenseApplicationDto }> {
    const data = await this.localLicenseApplicationsService.cancel(id);
    return { success: true, data };
  }
}