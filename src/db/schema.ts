import type { DatabaseSync } from 'node:sqlite';

export function initializeSchema(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(trim(title)) > 0),
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}
