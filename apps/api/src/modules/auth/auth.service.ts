import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from '@repo/shared';
import { UsersRepository } from '../users/repositories/users.repository';
import { LoginRequestDto } from './dtos/login-request.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

// AuthService — validates credentials and issues the session JWT.
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Validates username + password and issues a JWT plus the minimal user shape.
  async login(dto: LoginRequestDto): Promise<AuthDto> {
    // Only this query is allowed to see the password hash; it also joins the person.
    const user = await this.usersRepo.findByUsernameWithPassword(dto.username);

    // Same generic 401 for wrong username, wrong password, or inactive account.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      personId: user.personId,
    };
    const token = await this.jwtService.signAsync(payload, {
      // JWT_EXPIRES_IN is an env string like "1h" / "15m".
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        personId: user.personId,
        fullName: `${user.person.firstName} ${user.person.lastName}`,
      },
    };
  }
}