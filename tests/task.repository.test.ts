import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { openDatabase } from '../src/db/connection.js';
import { initializeSchema } from '../src/db/schema.js';
import { TaskRepository } from '../src/tasks/task.repository.js';

let directory: string;
let database: DatabaseSync;
let tasks: TaskRepository;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'task-service-'));
  database = openDatabase(join(directory, 'tasks.sqlite'));
  initializeSchema(database);
  tasks = new TaskRepository(database);
});

afterEach(() => {
  database.close();
  rmSync(directory, { recursive: true, force: true });
});

describe('TaskRepository', () => {
  it('persists, updates, and deletes tasks', () => {
    const created = tasks.create('Write tests');

    expect(tasks.list()).toEqual([created]);

    const updated = tasks.update(created.id, { status: 'completed' });
    expect(updated).toMatchObject({
      id: created.id,
      title: 'Write tests',
      status: 'completed',
    });

    expect(tasks.delete(created.id)).toBe(true);
    expect(tasks.list()).toEqual([]);
    expect(tasks.delete(created.id)).toBe(false);
  });
});
