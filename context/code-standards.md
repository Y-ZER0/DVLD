# code-standards.md

## 1. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Feature folder | `kebab-case` | `local-license-applications/` |
| Frontend request DTO (interface) | `PascalCase` + `RequestDto` | `CreatePersonRequestDto` |
| Frontend DTO file | `kebab-case.dto.ts` | `create-person-request.dto.ts` |
| Backend request DTO (class) | `PascalCase` + `RequestDto` | `CreatePersonRequestDto` |
| Shared response interface | `PascalCase` + `Dto` | `PersonDto`, `LicenseDto` |
| Frontend service | `camelCase` const object | `export const personService = {...}` |
| Backend service class | `PascalCase` + `Service` | `PeopleService` |
| Query key factory | `camelCase` + `Keys` | `peopleKeys`, `testAppointmentKeys` |
| Query hook (fetch) | `use` + `PascalCase` | `usePeople`, `usePerson` |
| Mutation hook | `use` + verb + `PascalCase` | `useCreatePerson`, `useRecordTestResult` |
| Zustand store file | `camelCase.store.ts` | `auth.store.ts` |
| Zustand store hook | `use` + `PascalCase` + `Store` | `useAuthStore` |
| UI component | `PascalCase` | `TestPipelineCard`, `IssueLicenseModal` |
| TypeORM entity | `PascalCase`, singular | `Person`, `TestAppointment` |
| Repository class | `PascalCase` + `Repository` | `PeopleRepository` |
| Controller class | `PascalCase` + `Controller` | `PeopleController` |
| NestJS module | `PascalCase` + `Module` | `PeopleModule` |
| Guard | `PascalCase` + `Guard` | `JwtAuthGuard` |
| Enum values | `SCREAMING_SNAKE_CASE` in TS, matches DB enum labels | `GENDER.MALE` |

Entity/table names in code are always the singular, PascalCase form of the
plural DB table (`People` table → `Person` entity, `Users` table → `User`
entity, `Applications` table → `Application` entity) — this matches TypeORM
convention and `fullstack-architecture-plan.md § 9`.

## 2. Structure & Imports

- Path aliases: `@/*` → `apps/web/src/*`; `@repo/shared` →
  `packages/shared/src`. Never use relative `../../../` chains across feature
  boundaries — if you need one, the code is in the wrong feature.
- Backend layer chain is fixed: `controller → service → repository → entity`.
  A controller never touches a repository directly. A repository never
  contains business logic (just TypeORM calls).
- Frontend layer chain is fixed: `page.tsx → feature ui/ → feature hooks/
  → feature services/ → shared/lib/api-client`. See
  `fullstack-architecture-plan.md § 4.2` for the full allowed-imports table —
  it is binding, not advisory.
- shadcn primitives live in `apps/web/src/components/ui/` and are
  regenerated via the CLI, never hand-edited.

## 3. Environment & Dependencies

- Package manager: **pnpm** only (`pnpm-workspace.yaml` covers `apps/*` and
  `packages/*`). Never mix in `npm install` or `yarn add`.
- Backend env vars (see `library-docs.md` for the full `.env` template):
  `DATABASE_URL` (pooler, runtime), `DATABASE_MIGRATION_URL` (direct,
  migrations only), `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `NODE_ENV`.
- Frontend env vars: `NEXT_PUBLIC_API_URL`.
- New dependencies are added at the workspace level that needs them
  (`apps/api`, `apps/web`, or `packages/shared`), never at the repo root
  unless they are genuinely shared tooling (turbo, typescript, prettier).

## 4. Backend & Logic

- Every unhandled exception is caught by `AllExceptionsFilter`, which returns
  `{ success: false, statusCode, message, path, timestamp }`. Never return a
  raw stack trace or an unshaped error body.
- Domain errors are thrown as NestJS exceptions from the **service** layer
  (`NotFoundException`, `ConflictException`, `BadRequestException`), never
  from the controller and never from the repository.
- `ValidationPipe` is global with `{ whitelist: true, forbidNonWhitelisted:
  true, transform: true }` — this is what makes `@ParseIntPipe` and DTO
  decorators actually work; never disable it per-route.
- Controllers only: extract params/body/query → call one service method →
  wrap the result in `{ success: true, data }` (or `{ success: true, data,
  meta }` for paginated lists). No branching logic in a controller.
- Multi-table writes that must succeed or fail together (license issuance +
  driver creation, renewal + deactivation of the old license) run inside a
  TypeORM transaction (`queryRunner` or `dataSource.transaction(...)`) — never
  as two sequential `await`s that could leave the DB half-written.

## 5. Comment Policy

**This section is binding — see `AGENTS.md § 3.2` for when it applies.**

Comments are allowed in exactly two file types, and nowhere else:

1. **Backend services** (`apps/api/**/*.service.ts`) — a short header comment
   above each method stating *what it does and why it exists*, plus a sparse
   `// why` line before a non-obvious step. Keep every comment to 1-2 lines;
   no `// STEP n:` numbering ladders, no paragraphs.
2. **Backend repositories** (`apps/api/**/*.repository.ts`) — comments only
   on **complex TypeORM queries**: multi-join query builders (shared
   count/page builders, always-on join sets), `NOT EXISTS`/subqueries, opt-in
   columns via `addSelect` (e.g. the password hash), and unique-constraint
   race backstops. Trivial one-line `find()`/`findOne()` calls get no comment.

Forbidden anywhere else — controllers, entities, DTOs, migrations, guards,
decorators, frontend hooks/components/services, `packages/shared`, CSS: no
comments, period. Enforce intent with names (per § 1) instead. The REVIEW
skill (AGENTS.md § 4) verifies this on every sub-task.

### Allowed example — backend repository (complex query only)

```typescript
// Shared builder: every read joins the stage and the recorded outcome — the
// DTOs need them on all return paths; count and page stay in sync.
private joinedQb() {
  return this.repo
    .createQueryBuilder('appt')
    .leftJoinAndSelect('appt.testType', 'testType')
    .leftJoinAndSelect('appt.test', 'test');
}
```

### Allowed example — backend service (short, why-focused)

```typescript
// Replaces the password hash; only ever called with a fresh bcrypt hash.
async updatePassword(id: number, newHash: string) {
  const user = await this.usersRepo.findById(id);
  if (!user) throw new NotFoundException('User not found');
  await this.usersRepo.updatePasswordHash(id, newHash);
}
```

### Forbidden example — frontend (no comments anywhere)

```tsx
export function useRecordTestResult(appointmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RecordTestResultRequestDto) =>
      testingService.recordResult(appointmentId, dto),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.details(),
      }),
  });
}
```

## 6. Tailwind + shadcn/ui Conventions

- Never write a raw hex code or `rgb()` value in a component. Every color
  comes from a token defined in `ui-tokens.md` (`bg-primary`,
  `text-muted-foreground`, `border-destructive`, etc.) — Tailwind resolves
  these via the `@theme inline` block in `globals.css`.
- Use the `cn()` utility (`shared/lib/utils.ts`) to merge conditional
  classes — never string-concatenate class names.
- shadcn components are added via the CLI (`npx shadcn add <component>`) and
  live in `components/ui/`. If a primitive needs new behavior, wrap it in a
  feature-level component rather than editing the generated file.
- Status colors (Passed/Completed/Active = success, Scheduled/New/Pending =
  warning, Failed/Inactive/Expired/Detained = destructive, Locked = muted)
  follow the mapping in `ui-rules.md` exactly — don't invent a new status
  color per feature.

## 7. Forms (react-hook-form + zod)

- Every form-bearing feature (Feature 1.2 onwards) builds its forms with
  **react-hook-form + zod** (`zodResolver` from `@hookform/resolvers`) — see
  `library-docs.md § 9` for the worked pattern.
- The zod schema colocated with the form is the single validation source on
  the client; rules mirror the backend DTO (`library-docs.md § 2`).
- **Exception: the sign-in form (`features/auth/`) is explicitly excluded**
  (Session 4 decision) — it stays plain `useState`, and must not be
  retrofitted to RHF.
- `react-hook-form`/`zod` live in `apps/web` only — never in
  `packages/shared` (zero runtime deps rule).
