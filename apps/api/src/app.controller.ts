import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth() {
    return { success: true, data: { service: 'dvld-api', status: 'ok' } };
  }
}