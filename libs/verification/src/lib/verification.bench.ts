import { bench, describe } from 'vitest';
import type { AssertionSet, FileEntry } from '@nthtime/shared';
import { verify } from './pipeline.js';
import { createParser } from './grammar-loader.js';

// -- JavaScript (Express) --

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

const JS_FILES: FileEntry[] = [{ path: 'app.js', content: JS_CODE }];

const JS_ASSERTIONS: AssertionSet = {
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

// -- Python (FastAPI) --

const PY_CODE = `
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = Query(None)):
    return {"item_id": item_id, "q": q}
`.trim();

const PY_FILES: FileEntry[] = [{ path: 'main.py', content: PY_CODE }];

const PY_ASSERTIONS: AssertionSet = {
  perFile: {
    'main.py': [
      { type: 'pythonImport', module: 'fastapi', names: ['FastAPI'], description: 'Import FastAPI' },
      { type: 'pythonFunctionDef', name: 'read_root', decorator: 'app.get', description: 'Root endpoint' },
      { type: 'pythonFunctionDef', name: 'read_item', decorator: 'app.get', description: 'Items endpoint' },
    ],
  },
  crossFile: [],
};

// -- TSX (React) --

const TSX_CODE = `
import React, { useState } from 'react';

interface CounterProps {
  initial?: number;
}

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="counter">
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
`.trim();

const TSX_FILES: FileEntry[] = [{ path: 'Counter.tsx', content: TSX_CODE }];

const TSX_ASSERTIONS: AssertionSet = {
  perFile: {
    'Counter.tsx': [
      { type: 'importDeclaration', source: 'react', description: 'Import React' },
      { type: 'functionDeclaration', name: 'Counter', description: 'Counter component' },
      { type: 'methodCall', object: null, method: 'useState', description: 'Use useState hook' },
      { type: 'jsxElement', elementName: 'button', description: 'Render a button' },
    ],
  },
  crossFile: [],
};

// -- Multi-file (JS) --

const MULTI_FILES: FileEntry[] = [
  { path: 'app.js', content: JS_CODE },
  { path: 'routes.js', content: `import express from 'express';\nconst router = express.Router();\nrouter.get('/health', (req, res) => res.json({ok:true}));\nexport default router;` },
];

const MULTI_ASSERTIONS: AssertionSet = {
  perFile: {
    'app.js': [
      { type: 'importDeclaration', source: 'express', description: 'Import express' },
      { type: 'variableDeclaration', name: 'app', kind: 'const', description: 'Create app' },
    ],
    'routes.js': [
      { type: 'importDeclaration', source: 'express', description: 'Import express' },
      { type: 'variableDeclaration', name: 'router', kind: 'const', description: 'Create router' },
    ],
  },
  crossFile: [
    { type: 'exportPresence', name: 'default', exportKind: 'default', description: 'Default export in routes' },
  ],
};

describe('verification pipeline benchmarks', () => {
  bench('parse JS file', async () => {
    const parser = await createParser('javascript');
    parser.parse(JS_CODE);
  });

  bench('JS: 4 assertions (Express)', async () => {
    await verify(JS_ASSERTIONS, JS_FILES);
  });

  bench('Python: 3 assertions (FastAPI)', async () => {
    await verify(PY_ASSERTIONS, PY_FILES);
  });

  bench('TSX: 4 assertions (React)', async () => {
    await verify(TSX_ASSERTIONS, TSX_FILES);
  });

  bench('Multi-file: 2 files + cross-file', async () => {
    await verify(MULTI_ASSERTIONS, MULTI_FILES);
  });
});
