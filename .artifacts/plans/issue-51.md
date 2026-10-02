# RAN-51 — TM-002: Bootstrap Next.js TypeScript application

## Goal

Make this repository runnable as a documented Next.js TypeScript frontend foundation using the App Router, Tailwind CSS, shadcn/ui, strict typing, linting, and a feature-oriented source layout. `npm run dev` must start the Next.js application, and `npm run typecheck`, `npm run lint`, and the existing relevant tests must pass.

## Baseline and architecture decision

Verified on October 2, 2026 against `Raymond12324/mastra-tfactory-test` at `fa09677`:

- The repository is currently an Express/SQLite task-service foundation, not a Next.js project.
- The current root scripts start and build that service; its 12 tests, typecheck, and lint all pass after `npm ci`.
- The Linear card is explicitly a high-priority frontend/MVP request and specifies Next.js, App Router, Tailwind, shadcn/ui, aliases, strict mode, linting, and a feature layout.

Implement Next.js as the repository's **primary application** without deleting the existing service foundation. Root `dev`, `build`, and `start` commands will serve the Next.js app to meet this card's acceptance criteria. Preserve the existing service code and expose equivalent explicit API scripts (for example `dev:api`, `build:api`, and `start:api`) so TM-002 does not silently remove prior functionality. No browser-to-Express integration is part of this bootstrap card.

## Scope

### In scope

- Root Next.js application with TypeScript and App Router.
- Tailwind setup and shadcn/ui initialization/configuration.
- A minimal responsive landing page and shared UI primitive proving the styling/component setup works.
- `@/*` import alias, strict type checking, ESLint integration, and a feature-oriented directory layout.
- Updated scripts and README documentation for frontend and retained API commands.
- Build, lint, typecheck, existing service tests, and manual development-server verification.

### Out of scope

- Migrating the Express routes or SQLite repository into Next.js route handlers.
- Building task-management UI, authentication, data fetching, or API integration.
- Running frontend and API processes together from one command.
- Changing existing Express service behavior or data schema.

## Implementation phases

### Phase 1 — Establish the dual-runtime project tooling

1. Update `package.json` to add the Next.js, React, React DOM, Tailwind, shadcn/ui, and required type/lint dependencies compatible with the repository's Node 22 runtime.
2. Change root `dev`, `build`, and `start` scripts to run the Next.js application. Retain the Express service through clearly named API-specific scripts instead of deleting it.
3. Add a Next.js configuration file and a frontend TypeScript configuration that keeps strict mode enabled and introduces the `@/*` alias.
4. Split or adjust TypeScript build configuration as needed so the preserved Node service can still build independently into `dist` while the primary frontend uses Next.js's generated type configuration and build output.
5. Update the flat ESLint configuration to lint the App Router/React code using Next.js's recommended rules while continuing to lint the existing Node service and test files.
6. Add Tailwind/PostCSS configuration and a `components.json` shadcn/ui manifest configured to use the selected alias and stylesheet.

**Verification:** clean-install dependencies; run the frontend and API type checks; run lint; confirm both script groups resolve their entrypoints without configuration errors.

### Phase 2 — Create the App Router foundation and feature layout

1. Add the App Router files for root layout, global stylesheet, and home page. Include metadata and the minimum document structure required by Next.js.
2. Create a small polished startup page that identifies the application as the task-management MVP foundation. It must render successfully without coupling to the existing API.
3. Initialize shadcn/ui by adding at least one generated shared primitive (such as `components/ui/button.tsx`) and its required utility dependencies; use it on the startup page to prove the setup is real rather than configuration-only.
4. Add feature-oriented directories (for example `features/tasks/`) and shared frontend locations (`components/`, `lib/`) with only the minimum source files necessary to make their conventions concrete. Do not create empty placeholder implementations.
5. Ensure imports on the page and generated component use the `@/*` alias, and retain code style consistent with the repository's existing TypeScript conventions.

**Verification:** run `npm run build` to compile and statically validate the App Router pages; run `npm run dev`, request the root page, and confirm Next.js—not the old Express listener—is serving it.

### Phase 3 — Preserve service verification and document developer workflows

1. Confirm existing Express imports, tests, and persistence behavior are untouched. If the configuration split changes script names or output locations, make the minimal matching adjustments required for the service commands and no behavior changes.
2. Update `README.md` from its current service-only orientation to document:
   - the primary Next.js application and its root commands;
   - the retained service commands and their role;
   - the App Router/Tailwind/shadcn/feature directory conventions;
   - environment configuration that remains specific to the API service.
3. Update `.env.example` only if the frontend introduces a real runtime setting; do not add speculative environment variables.
4. Add focused automated coverage only where configuration or reusable frontend utilities introduce behavior that cannot be adequately proven by build/typecheck. The existing API tests remain the regression suite for the preserved service.

**Verification:**

```sh
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run dev
```

While `npm run dev` is active, load the root route and verify it returns the Next.js page. Separately run the retained API development command long enough to confirm it still starts successfully with its existing port and environment defaults.

## Acceptance mapping

| Linear acceptance criterion | Planned proof |
| --- | --- |
| `npm run dev` works | Root `dev` script starts Next.js; manual request of `/` returns the App Router startup page. |
| Typecheck and lint pass | Run root `npm run typecheck` and `npm run lint` after a clean install. |
| Base structure documented | README documents application/API commands and the App Router, shared-component, utility, and feature locations. |
| Relevant tests pass | Run the retained Vitest service suite; frontend compilation is verified by `next build`. |

## Risks and mitigations

- **Two runtime configurations can conflict.** Keep the primary Next.js configuration and API TypeScript configuration explicit, with distinct output ownership (`.next` versus `dist`) and scripts.
- **Next.js TypeScript defaults may absorb existing Node files.** Verify the combined typecheck after configuration changes; isolate API compilation only if a concrete incompatibility appears.
- **Tailwind and shadcn/ui generator conventions can change.** Use the versions installed into the lockfile and validate the generated component with lint, typecheck, and production build rather than relying on generator success alone.
- **Changing root scripts could conceal the existing API.** Preserve it behind documented API-specific scripts and run it during final verification.

## Assumptions

- The planned frontend should coexist with the existing service because the Linear card is labeled `Frontend` and asks only to bootstrap the client; no explicit authorization exists to remove the already-verified backend.
- A minimal startup page and one shadcn/ui primitive are sufficient to prove the requested bootstrap; product features are intentionally deferred.
- The repository will remain a single package for this card; a workspace split would add tooling scope without being required by the acceptance criteria.

## Human open questions

None blocking execution. The selected non-destructive coexistence approach preserves the prior Express work while making the requested Next.js frontend the primary application. A later card can decide whether to integrate or replace the API boundary.
