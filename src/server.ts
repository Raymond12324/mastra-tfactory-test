import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { openDatabase } from './db/connection.js';
import { initializeSchema } from './db/schema.js';
import { TaskRepository } from './tasks/task.repository.js';

const config = loadConfig(process.env);
const database = openDatabase(config.databasePath);
initializeSchema(database);

const server = createApp(new TaskRepository(database)).listen(config.port, () => {
  console.log(`Task service listening on port ${config.port}`);
});

function close(): void {
  server.close(() => database.close());
}

process.once('SIGINT', close);
process.once('SIGTERM', close);
