import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from '@repo/shared';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginRequestDto } from './dtos/login-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<{ success: true; data: AuthDto }> {
    const data = await this.authService.login(dto);
    return { success: true, data };
  }
}