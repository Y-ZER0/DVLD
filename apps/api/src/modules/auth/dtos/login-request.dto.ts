import { IsNotEmpty, IsString } from 'class-validator';

// LoginRequestDto — backend validation shape for POST /api/auth/login
// (invariant #10: classes with class-validator decorators, never plain
// interfaces). The frontend counterpart interface lives in @repo/shared.
export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}