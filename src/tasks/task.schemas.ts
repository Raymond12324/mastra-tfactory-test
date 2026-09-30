import { z } from 'zod';

import { taskStatuses } from './task.types.js';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    status: z.enum(taskStatuses).optional(),
  })
  .refine((value) => value.title !== undefined || value.status !== undefined, {
    message: 'At least one field must be provided',
  });
