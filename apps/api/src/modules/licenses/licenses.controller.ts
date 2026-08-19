import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { LicenseDto } from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { LicensesService } from './licenses.service';
import { IssueLicenseRequestDto } from './dtos/issue-license-request.dto';

@Controller('local-license-applications')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post(':id/issue-license')
  async issueLicense(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: IssueLicenseRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: true; data: LicenseDto }> {
    const data = await this.licensesService.issueLicense(id, dto, user.userId);
    return { success: true, data };
  }
}