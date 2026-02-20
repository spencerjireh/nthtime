import { describe, it, expect } from 'vitest';
import type { AssertionSet, FileEntry } from '@nthtime/shared';
import { verify } from './pipeline.js';

describe('verification pipeline', () => {
  it('passes a multi-file challenge with correct code', async () => {
    const files: FileEntry[] = [
      {
        path: 'app.js',
        content: `
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/hello', (req, res) => {
  return res.json({ message: 'Hello World' });
});

export default app;
`.trim(),
      },
      {
        path: 'server.js',
        content: `
import app from './app.js';

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server running');
});
`.trim(),
      },
    ];

    const assertions: AssertionSet = {
      perFile: {
        'app.js': [
          { type: 'importDeclaration', source: 'express', description: 'Import express' },
          { type: 'variableDeclaration', name: 'app', kind: 'const', description: 'Create app' },
          { type: 'methodCall', object: 'app', method: 'get', description: 'Define GET route' },
          { type: 'exportDeclaration', name: 'app', isDefault: true, description: 'Export app' },
        ],
        'server.js': [
          { type: 'importDeclaration', source: './app.js', description: 'Import app' },
          { type: 'variableDeclaration', name: 'PORT', kind: 'const', description: 'Define PORT' },
          { type: 'methodCall', object: 'app', method: 'listen', description: 'Start server' },
        ],
      },
      crossFile: [],
    };

    const result = await verify(assertions, files);

    expect(result.passed).toBe(true);
    expect(result.totalAssertions).toBe(7);
    expect(result.passedAssertions).toBe(7);
    expect(result.fileResults).toHaveLength(2);
    expect(result.fileResults[0].passed).toBe(true);
    expect(result.fileResults[1].passed).toBe(true);
  });

  it('detects failures in incorrect code', async () => {
    const files: FileEntry[] = [
      {
        path: 'app.js',
        content: `
import express from 'express';
const app = express();
// Missing app.get() route
`.trim(),
      },
    ];

    const assertions: AssertionSet = {
      perFile: {
        'app.js': [
          { type: 'importDeclaration', source: 'express', description: 'Import express' },
          { type: 'methodCall', object: 'app', method: 'get', description: 'Define GET route' },
        ],
      },
      crossFile: [],
    };

    const result = await verify(assertions, files);

    expect(result.passed).toBe(false);
    expect(result.totalAssertions).toBe(2);
    expect(result.passedAssertions).toBe(1);
  });

  it('handles cross-file assertions', async () => {
    const files: FileEntry[] = [
      {
        path: 'server.js',
        content: "import app from './app.js';",
      },
      {
        path: 'app.js',
        content: "export default function app() {}",
      },
    ];

    const assertions: AssertionSet = {
      perFile: {},
      crossFile: [
        { type: 'importDeclaration', source: './app.js', description: 'server.js imports app.js' },
        { type: 'exportDeclaration', name: 'app', isDefault: true, description: 'app.js default exports' },
      ],
    };

    const result = await verify(assertions, files);

    expect(result.passed).toBe(true);
    expect(result.crossFileResults).toHaveLength(2);
    expect(result.crossFileResults.every((r: { passed: boolean }) => r.passed)).toBe(true);
  });

  it('handles missing files gracefully', async () => {
    const files: FileEntry[] = [];

    const assertions: AssertionSet = {
      perFile: {
        'missing.js': [
          { type: 'functionDeclaration', name: 'test', description: 'test fn' },
        ],
      },
      crossFile: [],
    };

    const result = await verify(assertions, files);

    expect(result.passed).toBe(false);
    expect(result.fileResults[0].passed).toBe(false);
    expect(result.fileResults[0].results[0].message).toContain('could not be parsed');
  });

  it('works with Python code', async () => {
    const files: FileEntry[] = [
      {
        path: 'main.py',
        content: `
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello"}

class ItemModel(BaseModel):
    name: str
`.trim(),
      },
    ];

    const assertions: AssertionSet = {
      perFile: {
        'main.py': [
          { type: 'pythonImport', module: 'fastapi', names: ['FastAPI'], description: 'Import FastAPI' },
          { type: 'pythonFunctionDef', name: 'read_root', decorator: 'app.get', description: 'Define route' },
          { type: 'pythonClassDef', name: 'ItemModel', bases: ['BaseModel'], description: 'Define model' },
        ],
      },
      crossFile: [],
    };

    const result = await verify(assertions, files);

    expect(result.passed).toBe(true);
    expect(result.passedAssertions).toBe(3);
  });
});
