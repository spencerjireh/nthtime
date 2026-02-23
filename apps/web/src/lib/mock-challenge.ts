import { Difficulty } from '@nthtime/shared';
import type { Challenge } from '@nthtime/shared';

export const MOCK_CHALLENGE: Challenge = {
  id: 'demo',
  title: 'Hello World Server',
  prompt: `Create a basic Express.js server that responds with a JSON message.

**Requirements:**
1. Import \`express\` and create an app instance stored in a \`const\` variable called \`app\`
2. Add a GET route at \`/api/hello\` that returns \`{ message: "Hello World" }\`
3. Export the app as the default export

The server setup (listening on a port) is already provided in \`server.js\`.`,
  difficulty: Difficulty.Beginner,
  tags: ['routes', 'get', 'json'],
  timeEstimateSeconds: 300,
  scaffolded: true,
  files: [
    {
      path: 'app.js',
      content: '// Create your Express app here\n',
    },
    {
      path: 'server.js',
      content: `import app from './app.js';\n\nconst PORT = 3000;\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});\n`,
    },
  ],
  hints: [
    'Start by importing express: import express from "express"',
    'Create the app with: const app = express()',
    'Define a route with: app.get("/api/hello", (req, res) => { ... })',
    'Return JSON with: res.json({ message: "Hello World" })',
  ],
  assertions: {
    perFile: {
      'app.js': [
        {
          type: 'importDeclaration',
          source: 'express',
          description: 'Import the express module',
        },
        {
          type: 'variableDeclaration',
          name: 'app',
          kind: 'const',
          description: 'Create an Express application instance',
        },
        {
          type: 'methodCall',
          object: 'app',
          method: 'get',
          description: 'Define a GET route handler',
        },
        {
          type: 'exportDeclaration',
          name: 'app',
          isDefault: true,
          description: 'Export the app as default',
        },
      ],
    },
    crossFile: [],
  },
  referenceSolution: [
    {
      path: 'app.js',
      content:
        "import express from 'express';\n\nconst app = express();\n\napp.get('/api/hello', (req, res) => {\n  res.json({ message: 'Hello World' });\n});\n\nexport default app;\n",
    },
    {
      path: 'server.js',
      content: `import app from './app.js';\n\nconst PORT = 3000;\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});\n`,
    },
  ],
};

const MOCK_REACT_CHALLENGE: Challenge = {
  id: 'ch_react_1',
  title: 'Counter with useState',
  prompt: `Build a simple counter component using React's useState hook.

**Requirements:**
1. Import \`useState\` from \`react\`
2. Create and export a function \`Counter\` component
3. Use \`useState\` to track the count
4. Render a \`<button>\` element that increments the count on click
5. Display the current count`,
  difficulty: Difficulty.Beginner,
  tags: ['useState', 'events', 'components'],
  timeEstimateSeconds: 300,
  scaffolded: true,
  files: [
    {
      path: 'Counter.tsx',
      content: '// Build a Counter component with useState\n',
    },
  ],
  hints: [
    'Import useState: import { useState } from "react"',
    'Initialize state: const [count, setCount] = useState(0)',
    'Use onClick handler on the button to call setCount',
  ],
  assertions: {
    perFile: {
      'Counter.tsx': [
        {
          type: 'importDeclaration',
          source: 'react',
          specifiers: ['useState'],
          description: 'Import useState from React',
        },
        {
          type: 'functionDeclaration',
          name: 'Counter',
          description: 'Define a Counter component',
        },
        {
          type: 'jsxElement',
          name: 'button',
          description: 'Render a button element',
        },
        {
          type: 'exportDeclaration',
          name: 'Counter',
          isDefault: false,
          description: 'Export the Counter component',
        },
      ],
    },
    crossFile: [],
  },
  referenceSolution: [
    {
      path: 'Counter.tsx',
      content:
        "import { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n",
    },
  ],
};

const MOCK_FASTAPI_CHALLENGE: Challenge = {
  id: 'ch_fastapi_1',
  title: 'Hello Endpoint',
  prompt: `Create a basic FastAPI application with a single endpoint.

**Requirements:**
1. Import \`FastAPI\` from \`fastapi\`
2. Create an app instance: \`app = FastAPI()\`
3. Define a function \`read_root\` decorated with \`@app.get('/')\` that returns \`{"message": "Hello World"}\``,
  difficulty: Difficulty.Beginner,
  tags: ['endpoints', 'get', 'basics'],
  timeEstimateSeconds: 300,
  scaffolded: true,
  files: [
    {
      path: 'main.py',
      content: '# Create a FastAPI app with a hello endpoint\n',
    },
  ],
  hints: [
    'Import FastAPI: from fastapi import FastAPI',
    'Create the app instance: app = FastAPI()',
    "Use a decorator for the route: @app.get('/')",
  ],
  assertions: {
    perFile: {
      'main.py': [
        {
          type: 'pythonImport',
          module: 'fastapi',
          names: ['FastAPI'],
          description: 'Import FastAPI from fastapi',
        },
        {
          type: 'pythonFunctionDef',
          name: 'read_root',
          decorator: 'app.get',
          description: 'Define a GET endpoint handler',
        },
      ],
    },
    crossFile: [],
  },
  referenceSolution: [
    {
      path: 'main.py',
      content:
        'from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get("/")\ndef read_root():\n    return {"message": "Hello World"}\n',
    },
  ],
};

// Map of mock challenge IDs to full Challenge objects for dev fallback
const MOCK_CHALLENGES_BY_ID: Record<string, Challenge> = {
  demo: MOCK_CHALLENGE,
  ch_express_1: MOCK_CHALLENGE,
  ch_react_1: MOCK_REACT_CHALLENGE,
  ch_fastapi_1: MOCK_FASTAPI_CHALLENGE,
};

export function getMockChallenge(id: string): Challenge | null {
  return MOCK_CHALLENGES_BY_ID[id] ?? null;
}
