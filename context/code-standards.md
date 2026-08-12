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

## 5. Mandatory Inline Documentation Protocol

**This section is binding — see `AGENTS.md § 3.2` for when it applies.**

Every time you implement a method, handler, hook, or component belonging to a
feature:

1. Write a one-to-two-line header comment above it stating *what it does and
   why it exists* (not a restatement of the function signature).
2. Inside the body, before each distinct logical step, write
   `// STEP n: <plain-language reasoning>` and place the code implementing
   that step directly beneath the comment.
3. The reasoning must explain *why this step exists / why it's ordered here*,
   referencing the relevant invariant number from `architecture.md` when the
   step exists specifically to satisfy one.
4. Write the comments in the order you will write the code — think of it as
   writing the pseudocode first, then filling in each line beneath its step.
5. If a method has no meaningful steps (a one-line getter, a trivial
   pass-through), a single header comment is sufficient — don't manufacture
   steps that don't exist.

### Worked example — backend (NestJS service method)

```typescript
// Records a Pass/Fail result against a scheduled test appointment and
// permanently locks that appointment, per architecture.md invariants #20/#21.
async recordTestResult(
  appointmentId: string,
  dto: RecordTestResultRequestDto,
  actingUserId: string,
): Promise<TestAppointmentDto> {
  // STEP 1: Load the appointment first. We cannot record a result for an
  //         appointment that doesn't exist, and we need its current
  //         lock state before deciding whether to proceed.
  const appointment = await this.appointmentsRepo.findById(appointmentId);
  if (!appointment) {
    throw new NotFoundException('Test appointment not found');
  }

  // STEP 2: Guard against double-recording (invariant #20). A locked
  //         appointment's result is a permanent audit fact — it must
  //         never be silently overwritten by a retried request.
  if (appointment.isLocked) {
    throw new ConflictException('This appointment is already locked');
  }

  // STEP 3: Persist the actual Pass/Fail row. This is what the rest of
  //         the app reads to decide whether the pipeline can advance.
  const test = await this.testsRepo.create({
    testAppointmentId: appointment.id,
    testResult: dto.result === 'passed',
    notes: dto.notes,
    createdByUserId: actingUserId, // session user, never dto (invariant #29)
  });

  // STEP 4: Lock the appointment. This is irreversible by design so that
  //         nobody — including a future version of this same method —
  //         can quietly edit history later.
  await this.appointmentsRepo.update(appointment.id, { isLocked: true });

  // STEP 5: If the applicant failed, we deliberately do nothing further
  //         here. The pipeline does not advance, and the "Schedule"
  //         action for this same stage will reappear on next read
  //         because a fresh appointment (invariant #21) is required.
  return this.toDto(appointment, test);
}
```

### Worked example — frontend (TanStack Query mutation hook)

```typescript
// Records a test result for a given appointment and refreshes the parent
// application's detail view once the server confirms the write.
export function useRecordTestResult(appointmentId: string) {
  // STEP 1: This mutates server state, so it belongs to TanStack Query —
  //         never to a Zustand store (invariant #1).
  const queryClient = useQueryClient();

  return useMutation({
    // STEP 2: The HTTP call itself is delegated to the service layer.
    //         Hooks never call apiClient/axios directly (invariant #4).
    mutationFn: (dto: RecordTestResultRequestDto) =>
      testingService.recordResult(appointmentId, dto),

    // STEP 3: On success, the one application detail this appointment
    //         belongs to is now stale — its pipeline state just changed.
    onSuccess: () => {
      // STEP 4: Invalidate rather than manually patch, so pass/fail and
      //         lock state always come from the server (invariant #6).
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.details(),
      });
    },
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
