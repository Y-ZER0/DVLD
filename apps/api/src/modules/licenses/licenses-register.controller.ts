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
import { LicenseDto, LicenseRegisterRowDto } from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { LicensesService } from './licenses.service';
import { RenewLicenseRequestDto } from './dtos/renew-license-request.dto';
import { ReplaceLicenseRequestDto } from './dtos/replace-license-request.dto';
import { PaginatedLicensesRegister } from './repositories/licenses.repository';

@Controller('licenses')
export class LicensesRegisterController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get('register')
  async findRegister(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: LicenseRegisterRowDto[];
    meta: PaginatedLicensesRegister['meta'];
  }> {
    const { data, meta } = await this.licensesService.findRegister(page, pageSize);
    return { success: true, data, meta };
  }

  @Post(':id/renew')
  async renew(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RenewLicenseRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: LicenseDto }> {
    const data = await this.licensesService.renewOrReplace(
      id,
      'renew',
      dto.notes,
      user.userId,
    );
    return { success: true, data };
  }

  @Post(':id/replace')
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceLicenseRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: LicenseDto }> {
    const data = await this.licensesService.renewOrReplace(
      id,
      dto.reason,
      dto.notes,
      user.userId,
    );
    return { success: true, data };
  }
}