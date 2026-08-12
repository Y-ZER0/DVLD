import { SetMetadata } from '@nestjs/common';

// Metadata key the JwtAuthGuard reads to decide whether a route opts out
// of authentication (architecture.md § Authentication & Core Patterns).
export const IS_PUBLIC_KEY = 'isPublic';

// Marks a route/controller as public — the global JwtAuthGuard skips it.
// Used for the login endpoint (you cannot require a token to get a token).
// Security stays "protected by default": every route NOT decorated is
// guarded, so forgetting the decorator is a safe failure (401).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);