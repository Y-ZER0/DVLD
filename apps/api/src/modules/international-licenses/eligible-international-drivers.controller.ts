import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InternationalEligibleDriverDto } from '@repo/shared';
import { InternationalLicensesService } from './international-licenses.service';
import { PaginatedInternationalLicenses } from './repositories/international-licenses.repository';

@Controller('drivers')
export class EligibleInternationalDriversController {
  constructor(
    private readonly internationalLicensesService: InternationalLicensesService,
  ) {}

  @Get('eligible-for-international')
  async findEligible(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ): Promise<{
    success: true;
    data: InternationalEligibleDriverDto[];
    meta: PaginatedInternationalLicenses['meta'];
  }> {
    const { data, meta } = await this.internationalLicensesService.findEligible(
      page,
      pageSize,
    );
    return { success: true, data, meta };
  }
}