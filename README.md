# Task service foundation

A small TypeScript HTTP service for creating and managing tasks. It uses Express for routing, SQLite for local persistence, Zod for request validation, and Vitest for integration coverage.

## Prerequisites

- Node.js 22.5 or newer
- npm

## Setup

```bash
npm ci
```

The service stores data in `data/tasks.sqlite` by default. The parent directory and database schema are created automatically when the service starts.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the service with file watching. |
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm start` | Run the compiled service. |
| `npm test -- --run` | Run the test suite once. |
| `npm run lint` | Lint application and test TypeScript. |
| `npm run typecheck` | Check TypeScript without emitting files. |

## Run locally

```bash
npm run dev
```

The default listener is `http://localhost:3000`. Configure it with:

- `PORT` — HTTP port; defaults to `3000`.
- `DATABASE_PATH` — SQLite database path; defaults to `data/tasks.sqlite`.

For example:

```bash
PORT=3001 DATABASE_PATH=/tmp/tasks.sqlite npm run dev
```

## API

`GET /health` returns `{ "status": "ok" }`.

Tasks have the following shape:

```json
{
  "id": 1,
  "title": "Ship foundation",
  "status": "pending",
  "createdAt": "2026-09-30T00:00:00.000Z",
  "updatedAt": "2026-09-30T00:00:00.000Z"
}
```

The only valid statuses are `pending` and `completed`.

```bash
curl http://localhost:3000/tasks
curl -X POST http://localhost:3000/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Ship foundation"}'
curl -X PUT http://localhost:3000/tasks/1 \
  -H 'content-type: application/json' \
  -d '{"status":"completed"}'
curl -X DELETE http://localhost:3000/tasks/1
```

## Verification

```bash
npm ci
npm run typecheck
npm run lint
npm test -- --run
npm run build
```
