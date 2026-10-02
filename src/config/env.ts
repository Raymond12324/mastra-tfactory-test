import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_PATH: z.string().trim().min(1).default('data/tasks.sqlite'),
});

export interface Config {
  port: number;
  databasePath: string;
}

export function loadConfig(environment: NodeJS.ProcessEnv): Config {
  const parsed = environmentSchema.safeParse(environment);

  if (!parsed.success) {
    const keys = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))].join(', ');
    throw new Error(`Invalid environment configuration: ${keys}`);
  }

  return {
    port: parsed.data.PORT,
    databasePath: parsed.data.DATABASE_PATH,
  };
}
