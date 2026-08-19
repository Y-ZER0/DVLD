import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  DetentionRegisterRowDto,
  EligibleLicenseForDetentionDto,
} from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { DetainReleaseService } from './detain-release.service';
import { PaginatedDetentions } from './repositories/detained-licenses.repository';
import { DetainLicenseRequestDto } from './dtos/detain-license-request.dto';

@Controller('detain-release')
export class DetainReleaseController {
  constructor(
    private readonly detainReleaseService: DetainReleaseService,
  ) {}

  @Get('active-licenses')
  async findEligible(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: EligibleLicenseForDetentionDto[];
    meta: PaginatedDetentions['meta'];
  }> {
    const { data, meta } = await this.detainReleaseService.findEligible(
      page,
      pageSize,
    );
    return { success: true, data, meta };
  }

  @Get('register')
  async findRegister(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: DetentionRegisterRowDto[];
    meta: PaginatedDetentions['meta'];
  }> {
    const { data, meta } = await this.detainReleaseService.findRegister(
      page,
      pageSize,
    );
    return { success: true, data, meta };
  }

  @Post('detain')
  async detain(
    @Body() dto: DetainLicenseRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: DetentionRegisterRowDto }> {
    const data = await this.detainReleaseService.detainLicense(
      dto,
      user.userId,
    );
    return { success: true, data };
  }

  @Post(':id/release')
  async release(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: DetentionRegisterRowDto }> {
    const data = await this.detainReleaseService.releaseLicense(
      id,
      user.userId,
    );
    return { success: true, data };
  }
}