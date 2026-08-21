import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  DriverDirectoryRowDto,
  DriverSummaryDto,
  DriverTestLogEntryDto,
  InternationalLicenseDto,
  LicenseRegisterRowDto,
} from '@repo/shared';
import { DriversService } from './drivers.service';
import { PaginatedDriversDirectory } from './repositories/drivers.repository';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: DriverDirectoryRowDto[];
    meta: PaginatedDriversDirectory['meta'];
  }> {
    const { data, meta } = await this.driversService.getDirectory(page, pageSize);
    return { success: true, data, meta };
  }

  @Get('search')
  async search(
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: DriverDirectoryRowDto[];
    meta: PaginatedDriversDirectory['meta'];
  }> {
    const { data, meta } = await this.driversService.searchDirectory(
      search,
      page,
      pageSize,
    );
    return { success: true, data, meta };
  }

  @Get(':id/summary')
  async getSummary(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: DriverSummaryDto }> {
    const data = await this.driversService.getSummary(id);
    return { success: true, data };
  }

  @Get(':id/local-licenses')
  async getLocalLicenseHistory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: LicenseRegisterRowDto[] }> {
    const data = await this.driversService.getLocalLicenseHistory(id);
    return { success: true, data };
  }

  @Get(':id/international-licenses')
  async getInternationalHistory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: InternationalLicenseDto[] }> {
    const data = await this.driversService.getInternationalHistory(id);
    return { success: true, data };
  }

  @Get(':id/test-log')
  async getTestLog(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: true; data: DriverTestLogEntryDto[] }> {
    const data = await this.driversService.getTestLog(id);
    return { success: true, data };
  }
}