import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from '@repo/shared';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginRequestDto } from './dtos/login-request.dto';

// AuthController — the single unauthenticated entry point: login only.
// Every route in every OTHER controller is protected by default; this one
// opts out via @Public() (see jwt-auth.guard.ts). No /me endpoint yet —
// the login response already carries the full session user.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  // Validates credentials and returns { success: true, data: AuthDto }.
  // Marked public so the global guard skips it — a login route that
  // demanded a token would be a chicken-and-egg dead end.
  async login(@Body() dto: LoginRequestDto): Promise<{ success: true; data: AuthDto }> {
    const data = await this.authService.login(dto);
    return { success: true, data };
  }
}