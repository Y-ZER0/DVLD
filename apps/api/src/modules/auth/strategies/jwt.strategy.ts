import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersRepository } from '../../users/repositories/users.repository';

export interface JwtPayload {
  userId: number;
  username: string;
  personId: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersRepo: UsersRepository,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set — refusing to start without a signing secret');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersRepo.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is no longer active');
    }

    return {
      userId: user.id,
      username: user.username,
      personId: user.personId,
    };
  }
}