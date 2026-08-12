import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';

// Minimal liveness endpoint for the scaffold: confirms the app boots and
// the /api prefix + success envelope are in place before any feature exists.
@Controller()
export class AppController {
  @Public()
  @Get()
  // Returns the standard success envelope so a smoke test against GET /api
  // can verify the global pipe/filter/prefix wiring end to end.
  getHealth() {
    return { success: true, data: { service: 'dvld-api', status: 'ok' } };
  }
}