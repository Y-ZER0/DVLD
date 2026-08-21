import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from '@repo/shared';
import { UpdateApplicationTypeRequestDto } from './dtos/update-application-type-request.dto';
import { UpdateLicenseClassRequestDto } from './dtos/update-license-class-request.dto';
import { UpdateTestTypeRequestDto } from './dtos/update-test-type-request.dto';
import { LookupService } from './lookup.service';

@Controller('lookup')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Get('license-classes')
  async findLicenseClasses(): Promise<{ success: true; data: LicenseClassDto[] }> {
    const data = await this.lookupService.findAllLicenseClasses();
    return { success: true, data };
  }

  @Get('application-types')
  async findApplicationTypes(): Promise<{ success: true; data: ApplicationTypeDto[] }> {
    const data = await this.lookupService.findAllApplicationTypes();
    return { success: true, data };
  }

  @Get('test-types')
  async findTestTypes(): Promise<{ success: true; data: TestTypeDto[] }> {
    const data = await this.lookupService.findAllTestTypes();
    return { success: true, data };
  }

  @Patch('license-classes/:id')
  async updateLicenseClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLicenseClassRequestDto,
  ): Promise<{ success: true; data: LicenseClassDto }> {
    const data = await this.lookupService.updateLicenseClass(id, dto);
    return { success: true, data };
  }

  @Patch('application-types/:id')
  async updateApplicationType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationTypeRequestDto,
  ): Promise<{ success: true; data: ApplicationTypeDto }> {
    const data = await this.lookupService.updateApplicationType(id, dto);
    return { success: true, data };
  }

  @Patch('test-types/:id')
  async updateTestType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestTypeRequestDto,
  ): Promise<{ success: true; data: TestTypeDto }> {
    const data = await this.lookupService.updateTestType(id, dto);
    return { success: true, data };
  }
}