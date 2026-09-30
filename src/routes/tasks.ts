import { Router } from 'express';

import { HttpError } from '../http/errors.js';
import { TaskRepository } from '../tasks/task.repository.js';
import { createTaskSchema, updateTaskSchema } from '../tasks/task.schemas.js';

function parseTaskId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, 'INVALID_ID', 'Task id must be a positive integer');
  }
  return id;
}

export function createTaskRouter(tasks: TaskRepository): Router {
  const router = Router();

  router.get('/tasks', (_request, response) => {
    response.json(tasks.list());
  });

  router.post('/tasks', (request, response) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Task title must be a non-empty string');
    }

    response.status(201).json(tasks.create(parsed.data.title));
  });

  router.put('/tasks/:id', (request, response) => {
    const parsed = updateTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Provide a non-empty title and/or a valid task status',
      );
    }

    const task = tasks.update(parseTaskId(request.params.id), parsed.data);
    if (!task) {
      throw new HttpError(404, 'NOT_FOUND', 'Task not found');
    }

    response.json(task);
  });

  router.delete('/tasks/:id', (request, response) => {
    if (!tasks.delete(parseTaskId(request.params.id))) {
      throw new HttpError(404, 'NOT_FOUND', 'Task not found');
    }

    response.status(204).send();
  });

  return router;
}
