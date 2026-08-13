import { Controller, Get } from '@nestjs/common';
import { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from '@repo/shared';
import { LookupService } from './lookup.service';

// LookupController — the read-only HTTP surface for the three configuration
// tables (build-plan.md § 3.1). One controller for the whole lookup domain
// (Session 11 refinement over three one-route controllers: every other
// module has a single controller, and Feature 11's PATCH
// /lookup/:kind/:id endpoints land here under the same prefix). Protected
// by the global JwtAuthGuard — no @Public() anywhere (invariant #31:
// JwtAuthGuard alone is the only access check in the app).
@Controller('lookup')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  // GET /lookup/license-classes — full register, plain array (no
  // pagination, Session 11 ARCHITECT decision): 7 seeded rows consumed by
  // dropdowns and fee lookups.
  @Get('license-classes')
  async findLicenseClasses(): Promise<{ success: true; data: LicenseClassDto[] }> {
    // STEP 1: The service owns the read and the toDto gate; the controller
    //         only shapes the envelope (controller-thin rule, code-standards).
    const data = await this.lookupService.findAllLicenseClasses();
    return { success: true, data };
  }

  // GET /lookup/application-types — full register (6 seeded rows).
  @Get('application-types')
  async findApplicationTypes(): Promise<{ success: true; data: ApplicationTypeDto[] }> {
    const data = await this.lookupService.findAllApplicationTypes();
    return { success: true, data };
  }

  // GET /lookup/test-types — full register in Vision → Written → Street
  // order (3 seeded rows; the order is the enforced test sequence, #19).
  @Get('test-types')
  async findTestTypes(): Promise<{ success: true; data: TestTypeDto[] }> {
    const data = await this.lookupService.findAllTestTypes();
    return { success: true, data };
  }
}