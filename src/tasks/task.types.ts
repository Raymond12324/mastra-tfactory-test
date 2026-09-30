export const taskStatuses = ['pending', 'completed'] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskUpdate {
  title?: string;
  status?: TaskStatus;
}
