import { bench, describe } from 'vitest';
import type { AssertionSet, FileEntry } from '@nthtime/shared';
import { verify } from './pipeline.js';
import { createParser } from './grammar-loader.js';

const JS_CODE = `
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/hello', (req, res) => {
  return res.json({ message: 'Hello World' });
});

app.post('/api/items', (req, res) => {
  const { name } = req.body;
  return res.json({ id: 1, name });
});

export default app;
`.trim();

const FILES: FileEntry[] = [{ path: 'app.js', content: JS_CODE }];

const ASSERTIONS: AssertionSet = {
  perFile: {
    'app.js': [
      { type: 'importDeclaration', source: 'express', description: 'Import express' },
      { type: 'variableDeclaration', name: 'app', kind: 'const', description: 'Create app' },
      { type: 'methodCall', object: 'app', method: 'get', description: 'GET route' },
      { type: 'methodCall', object: 'app', method: 'post', description: 'POST route' },
    ],
  },
  crossFile: [],
};

describe('verification pipeline benchmarks', () => {
  bench('parse a JS file', async () => {
    const parser = await createParser('javascript');
    parser.parse(JS_CODE);
  });

  bench('evaluate 4 assertions (single file)', async () => {
    await verify(ASSERTIONS, FILES);
  });

  bench('full pipeline end-to-end (parse + evaluate)', async () => {
    await verify(ASSERTIONS, FILES);
  });
});
