import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersRepository } from '../../users/repositories/users.repository';

// The shape of a validated session identity, attached to every
// authenticated request as request.user and surfaced via @CurrentUser().
// This is the only source of session identity on writes (invariant #29).
export interface JwtPayload {
  userId: number;
  username: string;
  personId: number;
}

// JwtStrategy — the "what makes a token valid" definition
// (architecture.md § Authentication & Core Patterns). It verifies the
// token's signature + expiry, then re-checks the account is still alive
// on every request so deactivating a user takes effect immediately.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersRepo: UsersRepository,
  ) {
    // STEP 1: The signing secret must be configured for signature checks
    //         to mean anything. A silent fallback (the previous
    //         'dev-only-secret') would make every token signed with that
    //         well-known value valid — fail loud at boot instead, so a
    //         missing env var is a startup error, never a security hole.
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set — refusing to start without a signing secret');
    }

    // STEP 2: Passport extracts the bearer token from the Authorization
    //         header and verifies it with the configured secret.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Runs after signature verification — decides what identity the rest of
  // the app sees on request.user.
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // STEP 1: Load the account and its person. A token for a deleted user
    //         is worthless, so fail closed (401) when the row is gone.
    // STEP 2: An inactive account must stop working immediately, not when
    //         the token expires — that is what IsActive means (Feature 2
    //         toggles it).
    const user = await this.usersRepo.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is no longer active');
    }

    // STEP 3: Return a fresh identity from the token, not from the DB row
    //         — @CurrentUser() consumers depend on this exact shape, and
    //         the entity itself must not travel beyond the service layer.
    return {
      userId: user.id,
      username: user.username,
      personId: user.personId,
    };
  }
}