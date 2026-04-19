// @vitest-environment jsdom
import { z } from 'zod';

const EnvSchema = z.object({
  API_URL: z.string().url(),
  FEATURE_FLAG_AUTH: z.coerce.boolean().default(false),
});

type Env = z.infer<typeof EnvSchema>;

function loadEnv(raw: Record<string, string | undefined>): Env {
  return EnvSchema.parse(raw);
}

describe('05 typed env config', () => {
  it('parses a valid env', () => {
    const env = loadEnv({ API_URL: 'https://api.example', FEATURE_FLAG_AUTH: 'true' });
    expect(env.API_URL).toBe('https://api.example');
    expect(env.FEATURE_FLAG_AUTH).toBe(true);
  });

  it('applies defaults', () => {
    const env = loadEnv({ API_URL: 'https://api.example' });
    expect(env.FEATURE_FLAG_AUTH).toBe(false);
  });

  it('throws on missing required vars', () => {
    expect(() => loadEnv({})).toThrow();
  });
});
