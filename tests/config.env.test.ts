import { describe, expect, it } from 'vitest';

import { loadConfig } from '../src/config/env.js';

describe('loadConfig', () => {
  it('uses defaults when configuration is absent', () => {
    expect(loadConfig({})).toEqual({
      port: 3000,
      databasePath: 'data/tasks.sqlite',
    });
  });

  it('parses valid configuration values', () => {
    expect(
      loadConfig({
        PORT: '3001',
        DATABASE_PATH: ' /tmp/tasks.sqlite ',
      }),
    ).toEqual({
      port: 3001,
      databasePath: '/tmp/tasks.sqlite',
    });
  });

  it.each(['not-a-number', '3000.5', '0', '65536'])('rejects invalid ports', (port) => {
    expect(() => loadConfig({ PORT: port })).toThrow('Invalid environment configuration: PORT');
  });

  it('rejects blank database paths', () => {
    expect(() => loadConfig({ DATABASE_PATH: '   ' })).toThrow(
      'Invalid environment configuration: DATABASE_PATH',
    );
  });
});
