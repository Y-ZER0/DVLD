import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from '@repo/shared';
import { UsersRepository } from '../users/repositories/users.repository';
import { LoginRequestDto } from './dtos/login-request.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

// AuthService — validates credentials and issues the session token
// (architecture.md § Authentication & Core Patterns). Deliberately
// stateless beyond the issued JWT: the only source of truth is the
// bcrypt hash in Users.Password and the lookup rows in ApplicationTypes
// are untouched by this module.
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Validates username + password and, on success, issues a JWT plus the
  // minimal AuthUserDto shape ({ id, username, personId, fullName }) the
  // client stores in its persist layer — no role field exists (inv. #31).
  async login(dto: LoginRequestDto): Promise<AuthDto> {
    // STEP 1: Load the account WITH its password hash and its People row.
    //         This is the one query allowed to see the hash (inv #15),
    //         and fullName/personId for the response come from the same
    //         JOIN so we never touch the DB twice.
    const user = await this.usersRepo.findByUsernameWithPassword(dto.username);

    // STEP 2: Fail closed with the identical 401 for BOTH wrong-username
    //         and wrong-password — leaking which one failed helps
    //         credential probing. Account existence is deliberately not
    //         disclosed here.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // STEP 3: An inactive account is rejected at login even though the
    //         credentials are correct — same generic message keeps the
    //         probe-veil intact.
    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // STEP 4: Build the token payload from the verified row and sign it
    //         with the env-configured secret + expiry (library-docs § 1).
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      personId: user.personId,
    };
    const token = await this.jwtService.signAsync(payload, {
      // STEP 5: JWT_EXPIRES_IN is an env string like "1h"/"15m" — cast to
      //         JwtSignOptions' StringValue type (jsonwebtoken's ms strings).
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    });

    // STEP 6: Project the response through the shared AuthDto contract —
    //         the entity leaves the service layer exactly never.
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