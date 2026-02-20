import { Difficulty } from '@nthtime/shared';
import type { Challenge } from '@nthtime/shared';

export const MOCK_CHALLENGE: Challenge = {
  id: 'demo',
  title: 'Express Hello World',
  prompt: `Create a basic Express.js server that responds with a JSON message.

**Requirements:**
1. Import \`express\` and create an app instance
2. Add a GET route at \`/api/hello\` that returns \`{ message: "Hello World" }\`
3. Export the app as the default export

The server setup (listening on a port) is already provided in \`server.js\`.`,
  difficulty: Difficulty.Beginner,
  tags: ['express', 'node', 'api'],
  timeEstimateSeconds: 300,
  scaffolded: true,
  files: [
    {
      path: 'app.js',
      content: `// Create your Express app here\n`,
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
};
