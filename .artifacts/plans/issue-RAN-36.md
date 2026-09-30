# RAN-36 — Foundation & Architecture implementation plan

## Goal

Turn the currently documentation-only repository into a reproducible TypeScript task-service foundation that supports the P0 core loop: start a local HTTP API, persist tasks in SQLite, validate writes, and prove the CRUD contract through automated tests. Done means a clean checkout can install dependencies, run development/build/typecheck/lint/test commands, initialize its local database without manual setup, and serve the four task endpoints requested by the related service work item.

## Scope

**In**

- Node.js + TypeScript project tooling and documented commands.
- Express HTTP service with a clear composition root, routing, request validation, error mapping, and graceful server startup.
- Local SQLite persistence, schema initialization, and a repository boundary for tasks.
- `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id`.
- Zod request schemas and Vitest integration coverage against an isolated SQLite database.
- README instructions for local setup and verification.

**Out**

- Authentication/authorization, users or multi-tenancy.
- Pagination, filtering, task due dates, tags, or post-MVP workflow features.
- Hosted database/deployment configuration, observability integrations, and production migrations beyond safe local schema initialization.
- Generalized ORM/domain abstractions not needed for the task service.

## Phases

### 1. Establish the reproducible project baseline

**Changes**

- Add `package.json` and `package-lock.json` using npm scripts for `dev`, `build`, `start`, `test`, `lint`, and `typecheck`.
- Add `tsconfig.json` for strict TypeScript compilation into `dist/`.
- Add `eslint.config.js` for TypeScript source and test linting.
- Add `vitest.config.ts` and `src/test/setup.ts` for a repeatable test environment.
- Add `.gitignore` entries for dependencies, build output, local SQLite files, coverage, and environment overrides.
- Update `README.md` with Node/npm prerequisites, the command matrix, and the local database location/configuration.

**Tests and proof**

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm test -- --run`
- `npm run build`

The phase is complete when these commands work on a clean checkout even though no API behavior is implemented yet.

### 2. Add the application composition and HTTP contract

**Changes**

- Add `src/app.ts` to create and configure the Express application without listening on a port, so integration tests can run in-process.
- Add `src/server.ts` as the production composition root that reads `PORT` and `DATABASE_PATH`, initializes dependencies, and starts the listener.
- Add `src/routes/tasks.ts` for the four task routes and `src/routes/health.ts` for a minimal startup health check.
- Add `src/http/errors.ts` and `src/http/error-handler.ts` for consistent 400/404/500 JSON responses; route handlers must pass unexpected failures through this middleware.
- Define the transport contract as `{ id, title, status, createdAt, updatedAt }`; accept only `title` on create and non-empty partial `title`/enumerated `status` changes on update.

**Tests and proof**

- Add `tests/health.integration.test.ts` to prove an app instance responds without a network listener.
- Add route-level tests asserting malformed JSON/body validation and unknown routes return the chosen error shape.
- Run the Phase 1 command matrix plus `npm test -- --run`.

The phase is complete when the HTTP layer can be created independently from process startup and has stable error semantics for callers.

### 3. Implement SQLite storage and task-domain operations

**Changes**

- Add `src/db/connection.ts` to open SQLite connections from `DATABASE_PATH`, enable foreign keys, and expose a close operation for tests/process shutdown.
- Add `src/db/schema.ts` to idempotently create the `tasks` table with integer primary key, non-empty title, constrained status (`pending`/`completed`), and ISO timestamp fields.
- Add `src/tasks/task.types.ts` and `src/tasks/task.repository.ts` with the narrow persistence operations: list, create, update, and delete/find result.
- Add `src/tasks/task.schemas.ts` with Zod schemas shared by route handlers, keeping HTTP validation separate from SQL binding.
- Add `src/tasks/task.service.ts` only for behavior that spans repository calls (for example, converting a missing record to a domain not-found result); avoid an ORM or generic repository abstraction.

**Tests and proof**

- Add focused repository tests using a temporary SQLite database to verify schema initialization, persisted data, updates, and deletion.
- Prove a new database path is initialized automatically and does not require a checked-in database file.
- Run `npm test -- --run`, `npm run typecheck`, and `npm run lint`.

The phase is complete when task persistence is isolated behind the repository boundary and is deterministic for both local runs and tests.

### 4. Connect CRUD routes and lock down the API behavior

**Changes**

- Wire the task repository/service into `src/app.ts` via explicit dependency injection; `src/server.ts` supplies the production SQLite instance, while tests provide temporary instances.
- Implement `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id` using the Phase 2 schemas and Phase 3 repository results.
- Return `201` for successful creation, `200` for reads/updates, and `204` for deletion; return `404` for unknown task IDs and `400` for invalid identifiers or request bodies.
- Ensure SQL uses parameter binding and never derives queries from request values.

**Tests and proof**

- Add `tests/tasks.integration.test.ts` covering the complete lifecycle, empty lists, valid partial updates, invalid bodies/statuses/IDs, unknown IDs, and deletion visibility.
- Ensure each test suite owns an isolated temporary database and closes it in teardown.
- Run `npm test -- --run`, `npm run typecheck`, `npm run lint`, and `npm run build`.

The phase is complete when all documented endpoints meet the contract against actual SQLite persistence.

### 5. Finalize operational documentation and verify from scratch

**Changes**

- Complete `README.md` with environment variables, example curl requests/responses, task status values, and all verification commands.
- Confirm `CONTRIBUTING.md` remains accurate; update its branch naming example only if the repository’s maintained convention changes during implementation.
- Do not add deployment, authentication, or post-MVP feature documentation.

**Tests and proof**

- From a clean dependency state: `npm ci && npm run typecheck && npm run lint && npm test -- --run && npm run build`.
- Start the service with a disposable database path and manually verify the health endpoint plus one create/list/update/delete cycle using curl.
- Run `git diff --check` before review.

The phase is complete when a new contributor can reproduce the working service using the README alone and all quality gates reported by the PR template pass.

## Design decisions and rejected alternatives

- Use **Express** rather than Fastify because the related service issue explicitly permits either and the minimal middleware/routing model is the lowest-risk, widely understood baseline for this empty repository.
- Use **npm** and commit its lockfile because npm is available in the execution environment and there is no existing package-manager convention.
- Use **SQLite with a small parameterized repository layer**, not an ORM: the P0 data model is a single table, and direct SQL keeps schema behavior, tests, and local setup transparent.
- Use **Zod at the HTTP boundary** and TypeScript internally; do not use schemas as a persistence abstraction.
- Use **Vitest + Supertest integration tests** against temporary SQLite files, not mocked persistence, so the core HTTP-to-database contract is exercised without a separate server process.
- Add ESLint because the repository’s PR template requires lint reporting and the epic explicitly calls for a reproducible development baseline; do not introduce formatting/pre-commit tooling beyond that baseline.

## Risks

- **Native SQLite dependency install failures:** pin a Node version range supported by the chosen SQLite driver and prove `npm ci` in the target environment before expanding the implementation. If native installation becomes unreliable, reassess a pure-JS/Node-bundled SQLite option rather than bypassing persistence tests.
- **Database state leaking between tests:** construct a fresh temporary database per suite/test context and close connections in teardown; add a test that proves an empty new database returns an empty list.
- **API contract drift:** make route tests assert status codes and response bodies for every endpoint and every error category.
- **Overbuilding the epic:** reject auth, pagination, deployment, generic data access abstractions, and post-MVP task fields unless a new approved story requires them.
- **Documentation becoming stale:** use the same commands in README, package scripts, and final verification so the PR can demonstrate they match.

## Assumptions

- The target is `Raymond12324/mastra-tfactory-test`; verified root is `/workspace/mastra-tfactory-test` and remote is `https://github.com/Raymond12324/mastra-tfactory-test.git`.
- The current branch remains documentation-only: it has three tracked files, a single visible merge commit (`06893dd`), and no package/tooling/runtime/test configuration. This confirms the triage understanding.
- GitHub issue #1 is the intended P0 functional increment to ground this otherwise broad epic, despite no explicit Linear/GitHub relationship. The plan uses its stated Node.js/TypeScript, SQLite, Zod, CRUD, and test requirements as the concrete baseline.
- The service has exactly two initial statuses, `pending` and `completed`; this is the smallest useful status model consistent with the related issue’s update requirement.
- Foundation delivery may be implemented as one branch/PR for this Factory work item, while the phases remain independently verifiable checkpoints.

## Open questions

- None for implementation. If product stakeholders require a status vocabulary other than `pending`/`completed`, a new product decision should update the API contract before client integrations are built.
