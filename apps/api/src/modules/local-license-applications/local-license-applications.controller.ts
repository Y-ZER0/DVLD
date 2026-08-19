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

@Controller('local-license-applications')
export class LocalLicenseApplicationsController {
  constructor(
    private readonly localLicenseApplicationsService: LocalLicenseApplicationsService,
  ) {}

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
    const { data, meta } = await this.localLicenseApplicationsService.findAll({
      page,
      pageSize,
      search,
      status,
    });
    return { success: true, data, meta };
  }

  @Post()
  async create(
    @Body() dto: CreateLocalLicenseApplicationRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: LocalDrivingLicenseApplicationDto }> {
    const data = await this.localLicenseApplicationsService.create(dto, user.userId);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: LocalDrivingLicenseApplicationDto }> {
    const data = await this.localLicenseApplicationsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number  )
    : Promise<{ success: true; data: LocalDrivingLicenseApplicationDto }> {
    const data = await this.localLicenseApplicationsService.cancel(id);
    return { success: true, data };
  }
}