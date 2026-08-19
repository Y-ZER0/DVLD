import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InternationalLicenseDto } from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { InternationalLicensesService } from './international-licenses.service';
import { PaginatedInternationalLicenses } from './repositories/international-licenses.repository';
import { IssueInternationalLicenseRequestDto } from './dtos/issue-international-license-request.dto';

@Controller('international-licenses')
export class InternationalLicensesController {
  constructor(
    private readonly internationalLicensesService: InternationalLicensesService,
  ) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: InternationalLicenseDto[];
    meta: PaginatedInternationalLicenses['meta'];
  }> {
    const { data, meta } = await this.internationalLicensesService.findAll(
      page,
      pageSize,
    );
    return { success: true, data, meta };
  }

  @Post()
  async issue(
    @Body() dto: IssueInternationalLicenseRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: InternationalLicenseDto }> {
    const data = await this.internationalLicensesService.issueInternationalLicense(
      dto.driverId,
      user.userId,
    );
    return { success: true, data };
  }
}