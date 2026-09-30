import { createApp } from './app.js';
import { openDatabase } from './db/connection.js';
import { initializeSchema } from './db/schema.js';
import { TaskRepository } from './tasks/task.repository.js';

const port = Number(process.env.PORT ?? 3000);
const databasePath = process.env.DATABASE_PATH ?? 'data/tasks.sqlite';
const database = openDatabase(databasePath);
initializeSchema(database);

const server = createApp(new TaskRepository(database)).listen(port, () => {
  console.log(`Task service listening on port ${port}`);
});

function close(): void {
  server.close(() => database.close());
}

process.once('SIGINT', close);
process.once('SIGTERM', close);
