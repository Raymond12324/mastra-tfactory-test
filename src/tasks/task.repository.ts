import type { DatabaseSync } from 'node:sqlite';

import type { Task, TaskStatus, TaskUpdate } from './task.types.js';

interface TaskRow {
  id: number;
  title: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TaskRepository {
  constructor(private readonly database: DatabaseSync) {}

  list(): Task[] {
    const rows = this.database
      .prepare('SELECT id, title, status, created_at, updated_at FROM tasks ORDER BY id ASC')
      .all() as unknown as TaskRow[];
    return rows.map(toTask);
  }

  create(title: string): Task {
    const timestamp = new Date().toISOString();
    const result = this.database
      .prepare('INSERT INTO tasks (title, status, created_at, updated_at) VALUES (?, ?, ?, ?)')
      .run(title, 'pending', timestamp, timestamp);
    const row = this.database
      .prepare('SELECT id, title, status, created_at, updated_at FROM tasks WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as unknown as TaskRow;
    return toTask(row);
  }

  update(id: number, update: TaskUpdate): Task | undefined {
    const assignments: string[] = [];
    const values: (string | TaskStatus)[] = [];

    if (update.title !== undefined) {
      assignments.push('title = ?');
      values.push(update.title);
    }
    if (update.status !== undefined) {
      assignments.push('status = ?');
      values.push(update.status);
    }

    values.push(new Date().toISOString());
    const result = this.database
      .prepare(`UPDATE tasks SET ${assignments.join(', ')}, updated_at = ? WHERE id = ?`)
      .run(...values, id);

    if (Number(result.changes) === 0) {
      return undefined;
    }

    const row = this.database
      .prepare('SELECT id, title, status, created_at, updated_at FROM tasks WHERE id = ?')
      .get(id) as unknown as TaskRow;
    return toTask(row);
  }

  delete(id: number): boolean {
    const result = this.database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  }
}
