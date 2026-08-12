import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// JwtAuthGuard — the enforcement policy (architecture.md § Authentication):
// applied globally via APP_GUARD, it protects every route by default and
// lets @Public() routes through untouched. One gate, one rule: authenticated
// vs. not (invariant #31 — there is no finer-grained check in this system).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // STEP 1: Honor the @Public() opt-out first (method-level metadata
    //         takes precedence over class-level) — the global guard must
    //         never block the login endpoint it exists to protect.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // STEP 2: Otherwise defer to the passport 'jwt' strategy, which
    //         extracts + verifies the token and populates request.user.
    return super.canActivate(context);
  }
}