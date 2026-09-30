import express from 'express';

import { errorHandler, notFoundHandler } from './http/error-handler.js';
import { createHealthRouter } from './routes/health.js';
import { createTaskRouter } from './routes/tasks.js';
import { TaskRepository } from './tasks/task.repository.js';

export function createApp(tasks: TaskRepository) {
  const app = express();
  app.use(express.json());
  app.use(createHealthRouter());
  app.use(createTaskRouter(tasks));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
