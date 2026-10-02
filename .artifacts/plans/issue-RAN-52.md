# RAN-52 — Configure environment schema and secrets

## Goal

Create a server-only, typed configuration boundary for the existing task service. On startup, the service must resolve defaults for `PORT` and `DATABASE_PATH`, reject invalid values before opening SQLite or listening, and provide a checked-in `.env.example` documenting those variables. Done means configuration parsing has direct test coverage, `src/server.ts` consumes only validated values, no secret or public/client configuration is introduced, and the repository's typecheck, lint, tests, and production build pass.

## Scope

**In**

- Validate the service's two existing environment variables: `PORT` and `DATABASE_PATH`.
- Preserve the current defaults: `3000` and `data/tasks.sqlite`.
- Fail before database initialization/listener creation when configuration is invalid.
- Add a tracked `.env.example` without secret values.
- Document the sample-file workflow and validated values in the README.
- Add unit tests for the configuration contract.

**Out**

- Supabase, OpenAI, Mapbox, or generic external API variables: no matching integration exists in this repository.
- Public/client runtime configuration or bundle-exposure machinery: this is a server-only Node/Express service with no client build.
- Loading `.env` files at runtime: the current app accepts process environment supplied by the runtime, and the ticket only requires schema validation plus an example file.
- Changes to HTTP routes, persistence schema, task semantics, or deployment topology.

## Phases

### 1. Add a typed server configuration module

**Changes**

- Create `src/config/env.ts` (or the repository's equivalent focused configuration directory) using the existing `zod` dependency.
- Export a parser/function that accepts an environment object for unit testing and returns the resolved configuration shape:
  - `port`: defaults to `3000`; accepts a finite integer in the TCP port range `1`–`65535`.
  - `databasePath`: defaults to `data/tasks.sqlite`; rejects empty or whitespace-only values.
- Format schema failures into a concise application-owned startup error identifying the invalid environment key, without including unrelated environment values or secrets.
- Keep this module server-only: it must not be re-exported from a browser-facing entry point (none exists today) or expose a `public` config object.

**Tests**

- Add `tests/config.env.test.ts` using Vitest, following the direct unit-test style already used for domain code.
- Assert defaults are returned when both keys are absent.
- Assert valid explicit port/database values are normalized to the returned typed shape.
- Assert non-numeric, fractional, out-of-range, and blank values fail with key-specific errors.

**Verification**

```bash
npm test -- --run tests/config.env.test.ts
npm run typecheck
npm run lint
```

### 2. Consume validated configuration at the startup boundary

**Changes**

- Update `src/server.ts` to parse `process.env` before calling `openDatabase`, `initializeSchema`, or `createApp(...).listen(...)`.
- Replace direct `Number(process.env.PORT ?? 3000)` and raw `DATABASE_PATH` access with the typed config values.
- Preserve the existing listener log, shutdown behavior, database path default, and port default.
- Avoid importing the executable server module in tests because it owns process startup and signal handlers; test the parser directly instead.

**Tests**

- Rerun the configuration unit suite.
- Run the existing integration and repository suites to prove the app and database behavior remain unchanged.
- Manually verify startup behavior:
  - `PORT=not-a-number DATABASE_PATH=/tmp/ran-52.sqlite npm run dev` fails immediately with the application-owned configuration error.
  - `PORT=3001 DATABASE_PATH=/tmp/ran-52.sqlite npm run dev` starts successfully; terminate it cleanly after confirming the listener output.

**Verification**

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

### 3. Add the environment example and documentation

**Changes**

- Create `.env.example`, which is already explicitly allowed by `.gitignore`, containing only commented guidance and non-sensitive example/default values for `PORT` and `DATABASE_PATH`.
- Update `README.md`'s local-run configuration section to point to `.env.example`, list the validation rules/defaults, and state that this Node-only service has no public/client environment variable surface.
- Do not add provider-secrets placeholders: adding unused names would expand the supported contract and create ambiguity about required credentials.

**Tests**

- Review the sample for the absence of real credentials and consistency with the parser defaults.
- Confirm `.gitignore` continues to ignore `.env` and `.env.*` while allowing `.env.example`.

**Verification**

```bash
git check-ignore -v .env || true
git check-ignore -v .env.example || true
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

## Risks

- **Port coercion changes startup behavior.** Zod coercion can accidentally accept malformed input. Cover whitespace, decimal, non-numeric, and range-edge values explicitly; retain a numeric `port` in the returned config.
- **Database side effects before validation.** Ensure parsing stays at the top of `src/server.ts`, before `openDatabase`, so invalid configuration cannot create directories or SQLite files.
- **Accidental contract expansion.** Keep configuration limited to values the running service actually consumes. Do not predeclare provider secrets without their integrations.
- **Server-module test side effects.** Do not import `src/server.ts` into Vitest; isolate parsing in a dependency-free configuration module.
- **Sample env drift.** Keep `.env.example` and README defaults synchronized with the single config module and assert parser defaults in tests.

## Assumptions

- The Planning move approves the triage recommendation to scope RAN-52 to the current service's `PORT` and `DATABASE_PATH` contract.
- `zod` is the established validation dependency (`src/tasks/task.schemas.ts`), so no dependency change is needed.
- Valid TCP ports are integers from 1 through 65535; retaining `3000` as the default preserves documented behavior.
- The only server-side configuration consumer is `src/server.ts`; `createApp` intentionally remains configuration-free for existing in-process integration tests.
- Runtime `.env` loading is not necessary for the acceptance criteria because deployment tooling can populate `process.env`, and the repository currently contains no dotenv dependency or loader convention.
- “Secrets server-only” is satisfied for this codebase by keeping the configuration module reachable only from the Node startup entry point and by not introducing a client/public configuration surface.

## Open questions

None. Provider-specific secrets are deliberately deferred until their corresponding integrations are introduced.
