import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../strategies/jwt.strategy';

// Reads the authenticated identity off the request — populated by
// JwtStrategy on every authenticated request. This is the ONLY sanctioned
// source of CreatedByUserID/ReleasedByUserID on any write (invariant #29):
// session identity, never the request body.
// Usage: @CurrentUser() user: JwtPayload  |  @CurrentUser('userId') id: number
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);