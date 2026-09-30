import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/connection.js';
import { initializeSchema } from '../src/db/schema.js';
import { TaskRepository } from '../src/tasks/task.repository.js';

let directory: string;
let database: DatabaseSync;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'task-service-'));
  database = openDatabase(join(directory, 'tasks.sqlite'));
  initializeSchema(database);
  app = createApp(new TaskRepository(database));
});

afterEach(() => {
  database.close();
  rmSync(directory, { recursive: true, force: true });
});

describe('task service HTTP API', () => {
  it('reports its health without a network listener', async () => {
    await request(app).get('/health').expect(200, { status: 'ok' });
  });

  it('supports the full task lifecycle', async () => {
    await request(app).get('/tasks').expect(200, []);

    const createResponse = await request(app)
      .post('/tasks')
      .send({ title: 'Ship foundation' })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      id: expect.any(Number),
      title: 'Ship foundation',
      status: 'pending',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const id = createResponse.body.id as number;
    await request(app).get('/tasks').expect(200, [createResponse.body]);

    const updateResponse = await request(app)
      .put(`/tasks/${id}`)
      .send({ status: 'completed' })
      .expect(200);
    expect(updateResponse.body).toMatchObject({ id, status: 'completed' });

    await request(app).delete(`/tasks/${id}`).expect(204);
    await request(app).get('/tasks').expect(200, []);
  });

  it('returns stable errors for invalid input and missing resources', async () => {
    await request(app)
      .post('/tasks')
      .send({ title: '   ' })
      .expect(400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Task title must be a non-empty string',
        },
      });

    await request(app)
      .put('/tasks/not-an-id')
      .send({ status: 'completed' })
      .expect(400, {
        error: {
          code: 'INVALID_ID',
          message: 'Task id must be a positive integer',
        },
      });

    const invalidUpdateResponse = await request(app).put('/tasks/99').send({}).expect(400);
    expect(invalidUpdateResponse.body.error.code).toBe('VALIDATION_ERROR');

    await request(app).delete('/tasks/99').expect(404, {
      error: { code: 'NOT_FOUND', message: 'Task not found' },
    });

    await request(app).get('/missing').expect(404, {
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  it('rejects malformed JSON', async () => {
    await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{')
      .expect(400, {
        error: {
          code: 'INVALID_JSON',
          message: 'Request body contains invalid JSON',
        },
      });
  });
});
