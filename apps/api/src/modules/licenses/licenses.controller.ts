import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { LicenseDto } from '@repo/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { LicensesService } from './licenses.service';
import { IssueLicenseRequestDto } from './dtos/issue-license-request.dto';

// LicensesController — the licenses domain's HTTP surface. The route
// prefix intentionally mirrors build-plan.md § 6.1's product contract
// (POST /local-license-applications/:id/issue-license — the issuance
// action hangs off the application's resource path, which is how the
// 6.2 detail page calls it), even though the logic lives in the licenses
// module: keeping the route on the applications controller would create a
// module import cycle (licenses → applications is required for the
// application gates), so the licenses module owns the route instead.
// Protected automatically by the global JwtAuthGuard — no @Public()
// anywhere (invariant #31). Controller stays thin per code-standards.md
// § 4: extract params/body/session → one service call → envelope.
@Controller('local-license-applications')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  // Issues the license for a completed-pipeline application — 404 on an
  // unknown application or class, 409 when the application is not New,
  // 409 when any test stage isn't Passed (invariant #22), 409 when the
  // driver already holds an active license for the class (invariant #26).
  // The fee is snapshotted server-side (invariant #28); the issuing clerk
  // comes from the session (invariant #29), never the body.
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