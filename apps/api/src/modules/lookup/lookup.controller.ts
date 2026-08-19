import { Controller, Get } from '@nestjs/common';
import { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from '@repo/shared';
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
}