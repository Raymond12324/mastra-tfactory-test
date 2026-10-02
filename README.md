# Task Manager foundation

This repository contains the MVP's Next.js frontend foundation and the existing Express task API. The frontend is the primary application: it uses Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui conventions. The API remains available as a separate local service while product work is added.

## Prerequisites

- Node.js 22.5 or newer
- npm

## Setup

```bash
npm ci
```

## Frontend commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js application with file watching at `http://localhost:3000`. |
| `npm run build` | Create the production Next.js build in `.next/`. |
| `npm start` | Start the production Next.js application after a build. |
| `npm run typecheck` | Check both the frontend and retained API TypeScript projects. |
| `npm run lint` | Lint frontend, API, and test source files. |
| `npm test -- --run` | Run the API regression test suite once. |

## Frontend structure

- `app/` — App Router layouts, routes, and global styles.
- `components/ui/` — shared shadcn/ui-style primitives.
- `features/` — product code grouped by feature; the first task feature starts in `features/tasks/`.
- `lib/` — shared frontend utilities, including the `cn` class-name helper.

Imports use the `@/*` alias, rooted at the repository directory. Tailwind is configured through `app/globals.css`, and `components.json` records the shadcn/ui setup for generated primitives.

## Retained task API

The original Express/SQLite task service is intentionally retained and is not coupled to the frontend bootstrap.

| Command | Purpose |
| --- | --- |
| `npm run dev:api` | Start the API with file watching. |
| `npm run build:api` | Compile the API to `dist/`. |
| `npm run start:api` | Run the compiled API. |

The API stores data in `data/tasks.sqlite` by default. Its environment variables are API-only:

- `PORT` — HTTP port; defaults to `3000` and must be an integer from `1` through `65535`.
- `DATABASE_PATH` — SQLite database path; defaults to `data/tasks.sqlite` and cannot be blank.

For example, choose a different port when the frontend is already using `3000`:

```bash
PORT=3001 DATABASE_PATH=/tmp/tasks.sqlite npm run dev:api
```

### API routes

- `GET /health` returns `{ "status": "ok" }`.
- `GET /tasks` lists tasks.
- `POST /tasks` creates a task.
- `PUT /tasks/:id` updates a task.
- `DELETE /tasks/:id` removes a task.

## Verification

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Run `npm run dev` and load `http://localhost:3000` to check the frontend. Run `npm run dev:api` separately to check the retained service.
