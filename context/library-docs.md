# library-docs.md

Specific integration patterns for this project's dependencies. These are not
generic library docs — every example below is shaped to a real DVLD entity or
screen so there's no ambiguity about where it applies.

## 1. TypeORM + Supabase

`.env` (`apps/api/.env`):

```bash
# Transaction pooler (port 6543) — used by the running app
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Direct connection (port 5432) — migrations only, pooler doesn't support
# the SET commands TypeORM's migration runner emits
DATABASE_MIGRATION_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres

NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:3000
```

`TypeOrmModule.forRootAsync` must set `ssl: { rejectUnauthorized: false }`
(Supabase enforces SSL) and `synchronize: config.get('NODE_ENV') !==
'production'`. Run migrations with:

```bash
# Always against the DIRECT url, never the pooler
DATABASE_URL=$DATABASE_MIGRATION_URL pnpm typeorm migration:run
```

## 2. class-validator — DVLD-specific DTOs

National Number format (custom validator, used on every `Person`
create/update DTO):

```typescript
// dtos/create-person-request.dto.ts
import { IsString, Matches, IsEnum, IsDateString, IsEmail, IsOptional } from 'class-validator';
import { Gender } from '@repo/shared';

export class CreatePersonRequestDto {
  // Format enforced here so a malformed National Number never reaches the
  // database uniqueness check (invariant #25) — fail fast, cheap check first.
  @Matches(/^N-\d{8}$/, { message: 'National Number must match N-########' })
  nationalNumber: string;

  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsDateString() dateOfBirth: string;
  @IsEnum(Gender) gender: Gender;
  @IsString() address: string;
  @IsString() phone: string;
  @IsEmail() email: string;
  @IsString() countryName: string;
  @IsOptional() @IsString() photoUrl?: string;
}
```

Minimum-age enforcement for license class selection lives in the **service**
layer (not the DTO), because it depends on two records (`Person.dateOfBirth`
and `LicenseClasses.MinimumAllowedAge`):

```typescript
const age = differenceInYears(new Date(), person.dateOfBirth);
if (age < licenseClass.minimumAllowedAge) {
  throw new BadRequestException(
    `Applicant must be at least ${licenseClass.minimumAllowedAge} to apply for ${licenseClass.className}`,
  );
}
```

## 3. Password Hashing & Auth

```typescript
// users.service.ts — create()
const passwordHash = await bcrypt.hash(dto.password, 12); // cost factor 12, matches fullstack-architecture-plan.md
```

```typescript
// auth.service.ts — validateUser()
const user = await this.usersRepo.findByUsernameWithPassword(username); // select: false columns need an explicit opt-in query
if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
  throw new UnauthorizedException('Invalid credentials');
}
```

`JwtStrategy` validates the token and attaches `{ userId, personId }` to the
request; `@CurrentUser()` (custom param decorator) reads it back out — this is
the **only** source of `CreatedByUserID` on any write (invariant #29), never
the request body.

## 4. TanStack Query — key factories (DVLD examples)

```typescript
// features/local-license-applications/hooks/localLicenseApplicationKeys.ts
export const localLicenseApplicationKeys = {
  all: () => ['local-license-applications'] as const,
  lists: () => [...localLicenseApplicationKeys.all(), 'list'] as const,
  list: (filter?: string) => [...localLicenseApplicationKeys.lists(), { filter }] as const,
  details: () => [...localLicenseApplicationKeys.all(), 'detail'] as const,
  detail: (id: string) => [...localLicenseApplicationKeys.details(), id] as const,
};
```

Every other feature (`peopleKeys`, `usersKeys`, `testAppointmentKeys`,
`licenseKeys`, `internationalLicenseKeys`, `detainedLicenseKeys`,
`driverKeys`, `dashboardKeys`) follows this exact same shape. Never write a
raw `['people']` array inline in a `useQuery` call.

`staleTime` guidance: lookup data (license classes, application types, test
types) changes rarely — use `staleTime: 5 * 60_000`. Everything
transactional (applications, appointments, licenses) uses the default
`30_000`.

## 5. Zustand — store patterns

Only two client-state concerns exist in this app: **auth session** and **UI
chrome** (sidebar open/closed). Both follow
`fullstack-architecture-plan.md § 7.7` exactly — `persist` middleware for
`auth.store.ts` (survives refresh), no persistence needed for `ui.store.ts`.
Do not add a Zustand store for anything that comes from the API — that's
always TanStack Query.

## 6. Axios — `api-client.ts`

```typescript
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // read outside React, safe anywhere
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.replace('/');
    }
    return Promise.reject(error);
  },
);
```

## 7. Tailwind v4 + shadcn/ui Setup

This project uses Tailwind v4's CSS-first config (no `tailwind.config.js`
needed for theme tokens — see `ui-tokens.md` for the exact `globals.css`).
Required packages: `tailwindcss@^4`, `tw-animate-css`, and the shadcn CLI
output package. `apps/web/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "hooks": "@/hooks" }
}
```

Fonts: `next/font/google` — Inter (`--font-inter`, sans) and JetBrains Mono
(`--font-jetbrains-mono`, mono for IDs like `N-20348871`, `L-3`, `INT-1`),
loaded in the root `layout.tsx` and exposed as CSS variables consumed by
`ui-tokens.md`'s `--font-sans`/`--font-mono`.

## 8. Business Calculation Rules (do not hardcode these anywhere but here)

**Local license expiration:**
`Licenses.ExpirationDate = Licenses.IssueDate + LicenseClasses.DefaultValidityLength years`
(e.g. Ordinary Driving License, `DefaultValidityLength = 10` → issued
2026-08-11 expires 2036-08-11).

**International license expiration:**
Fixed **1-year** validity from `IssueDate`, independent of the underlying
local license's class or validity length (e.g. issued 2025-03-02, expires
2026-03-02). This is a hardcoded business rule, not a lookup value — there is
no `LicenseClasses` row for international licenses.

**Fee snapshot rule (invariant #28):** every `PaidFees` column is populated by
reading the *current* lookup value (`ApplicationTypes.ApplicationFees`,
`TestTypes.TestTypeFees`, `LicenseClasses.ClassFees`) inside the service
method that performs the write, and copying it — never joining back to the
lookup table to "recompute" a historical fee, and never accepting a fee value
from the frontend request body.

## 9. react-hook-form + zod — form patterns

**Forms on features that need one (new/edit modals, appointment scheduling,
issue/renew confirmations, etc.) use `react-hook-form` + `zod`** (with
`@hookform/resolvers`). The schema is the single source of truth: a zod
schema defines the shape and rules, `zodResolver` feeds it to RHF, and
`useForm<TSchema>` provides `register`/`handleSubmit`/`formState.errors` to
the UI. Error messages come from the resolver, not from hand-written local
state.

**Exceptions:** the login/sign-in form is *explicitly excluded* — it is a
simple two-field form (see `features/auth/components/sign-in-form.tsx`,
Session 4 decision) and keeps its current plain `useState` submit. Do not
retrofit it. Everything else (Feature 1.2 onwards) follows this section.

```tsx
// features/.../components/add-person-modal.tsx (shape, not final code)
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// STEP 1: The zod schema is the only validation definition — mirrors the
//         backend DTO rules (library-docs.md § 2) so the UI rejects
//         malformed input before it ever hits the API (fail fast, cheap
//         check first, same principle as invariant #25).
const personSchema = z.object({
  nationalNumber: z.string().regex(/^N-\d{8}$/, "National Number must match N-########"),
  firstName: z.string().min(1),
  // ...
})

// STEP 2: RHF owns field state + errors; the resolver wires the schema.
//         Submit receives the FULLY VALIDATED values — no manual checks.
const form = useForm<PersonFormValues>({
  resolver: zodResolver(personSchema),
  defaultValues: { /* per-field defaults */ },
})

// STEP 3: Mutations stay in TanStack Query (invariant #1) — the form
//         submits to the hook, the hook calls the service.
form.handleSubmit((values) => useCreatePerson.mutate(values))
```

Rules:

- One zod schema per form, colocated with the modal/component that owns it
  (`features/<feature>/components/`), never in `shared/` (invariant #13).
- Server responses that shape the form (e.g. combobox options) still come
  from TanStack Query hooks — React Hook Form only manages field state.
- Validation rules mirror the backend DTO (library-docs.md § 2) — the
  client check is a UX shortcut, never a security boundary.
- Keep the two libraries out of `packages/shared` (zero runtime deps rule,
  Session 1 decision) — they are `apps/web` dependencies only.
