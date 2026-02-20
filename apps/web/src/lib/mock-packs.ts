import type { Difficulty } from '@nthtime/shared';

export interface MockPack {
  _id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  framework?: string;
  version: string;
  author: string;
  tags: string[];
  challengeCount: number;
  passedCount: number;
}

export interface MockChallenge {
  _id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  timeEstimateSeconds: number;
  order: number;
  status: 'not-attempted' | 'failed' | 'passed';
}

export const MOCK_PACKS: MockPack[] = [
  {
    _id: 'pack_express',
    name: 'Express Basics',
    slug: 'express-basics',
    description:
      'Build HTTP servers with Express.js -- routes, middleware, and error handling.',
    language: 'javascript',
    framework: 'express',
    version: '1.0.0',
    author: 'nthtime',
    tags: ['node', 'http', 'backend'],
    challengeCount: 10,
    passedCount: 0,
  },
  {
    _id: 'pack_react',
    name: 'React Fundamentals',
    slug: 'react-fundamentals',
    description:
      'Master React hooks -- useState, useEffect, custom hooks, and composition patterns.',
    language: 'typescript',
    framework: 'react',
    version: '1.0.0',
    author: 'nthtime',
    tags: ['frontend', 'hooks', 'components'],
    challengeCount: 10,
    passedCount: 0,
  },
  {
    _id: 'pack_fastapi',
    name: 'FastAPI Basics',
    slug: 'fastapi-basics',
    description:
      'Build REST APIs with Python and FastAPI -- endpoints, models, and dependency injection.',
    language: 'python',
    framework: 'fastapi',
    version: '1.0.0',
    author: 'nthtime',
    tags: ['python', 'http', 'backend', 'api'],
    challengeCount: 10,
    passedCount: 0,
  },
];

export const MOCK_CHALLENGES: Record<string, MockChallenge[]> = {
  'express-basics': [
    {
      _id: 'ch_express_1',
      title: 'Hello World Server',
      difficulty: 'beginner' as Difficulty,
      tags: ['routes', 'get', 'json'],
      timeEstimateSeconds: 300,
      order: 1,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_2',
      title: 'Route Parameters',
      difficulty: 'beginner' as Difficulty,
      tags: ['routes', 'params', 'get'],
      timeEstimateSeconds: 300,
      order: 2,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_3',
      title: 'POST JSON Handler',
      difficulty: 'beginner' as Difficulty,
      tags: ['routes', 'post', 'json'],
      timeEstimateSeconds: 300,
      order: 3,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_4',
      title: 'Query String Filtering',
      difficulty: 'beginner' as Difficulty,
      tags: ['routes', 'query', 'get'],
      timeEstimateSeconds: 420,
      order: 4,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_5',
      title: 'Multiple Routes',
      difficulty: 'intermediate' as Difficulty,
      tags: ['routes', 'get', 'post'],
      timeEstimateSeconds: 480,
      order: 5,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_6',
      title: 'Custom Middleware',
      difficulty: 'intermediate' as Difficulty,
      tags: ['middleware', 'logging'],
      timeEstimateSeconds: 600,
      order: 6,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_7',
      title: 'Error Handling Middleware',
      difficulty: 'intermediate' as Difficulty,
      tags: ['middleware', 'errors'],
      timeEstimateSeconds: 600,
      order: 7,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_8',
      title: 'Express Router',
      difficulty: 'intermediate' as Difficulty,
      tags: ['router', 'modules'],
      timeEstimateSeconds: 600,
      order: 8,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_9',
      title: 'Static Files and CORS',
      difficulty: 'advanced' as Difficulty,
      tags: ['cors', 'static'],
      timeEstimateSeconds: 600,
      order: 9,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_10',
      title: 'Full REST API',
      difficulty: 'advanced' as Difficulty,
      tags: ['rest', 'crud', 'router'],
      timeEstimateSeconds: 900,
      order: 10,
      status: 'not-attempted',
    },
  ],
  'react-fundamentals': [
    {
      _id: 'ch_react_1',
      title: 'Counter with useState',
      difficulty: 'beginner' as Difficulty,
      tags: ['useState', 'events'],
      timeEstimateSeconds: 300,
      order: 1,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_2',
      title: 'Props Display',
      difficulty: 'beginner' as Difficulty,
      tags: ['props', 'components'],
      timeEstimateSeconds: 240,
      order: 2,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_3',
      title: 'useEffect Data Loader',
      difficulty: 'beginner' as Difficulty,
      tags: ['useEffect', 'fetch'],
      timeEstimateSeconds: 420,
      order: 3,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_4',
      title: 'Conditional Rendering',
      difficulty: 'beginner' as Difficulty,
      tags: ['conditional', 'props'],
      timeEstimateSeconds: 300,
      order: 4,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_5',
      title: 'Event Handling',
      difficulty: 'intermediate' as Difficulty,
      tags: ['events', 'useState'],
      timeEstimateSeconds: 360,
      order: 5,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_6',
      title: 'List with Keys',
      difficulty: 'intermediate' as Difficulty,
      tags: ['lists', 'keys'],
      timeEstimateSeconds: 420,
      order: 6,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_7',
      title: 'Custom Hook',
      difficulty: 'intermediate' as Difficulty,
      tags: ['custom-hooks', 'localStorage'],
      timeEstimateSeconds: 600,
      order: 7,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_8',
      title: 'Controlled Form',
      difficulty: 'intermediate' as Difficulty,
      tags: ['forms', 'controlled'],
      timeEstimateSeconds: 480,
      order: 8,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_9',
      title: 'Component Composition',
      difficulty: 'advanced' as Difficulty,
      tags: ['composition', 'multi-file'],
      timeEstimateSeconds: 600,
      order: 9,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_10',
      title: 'useReducer Todo',
      difficulty: 'advanced' as Difficulty,
      tags: ['useReducer', 'state'],
      timeEstimateSeconds: 900,
      order: 10,
      status: 'not-attempted',
    },
  ],
  'fastapi-basics': [
    {
      _id: 'ch_fastapi_1',
      title: 'Hello Endpoint',
      difficulty: 'beginner' as Difficulty,
      tags: ['endpoints', 'get'],
      timeEstimateSeconds: 300,
      order: 1,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_2',
      title: 'Path Parameters',
      difficulty: 'beginner' as Difficulty,
      tags: ['endpoints', 'path-params'],
      timeEstimateSeconds: 300,
      order: 2,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_3',
      title: 'Query Parameters',
      difficulty: 'beginner' as Difficulty,
      tags: ['endpoints', 'query-params'],
      timeEstimateSeconds: 300,
      order: 3,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_4',
      title: 'Request Body with Pydantic',
      difficulty: 'beginner' as Difficulty,
      tags: ['pydantic', 'models'],
      timeEstimateSeconds: 420,
      order: 4,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_5',
      title: 'Response Model',
      difficulty: 'intermediate' as Difficulty,
      tags: ['pydantic', 'response-model'],
      timeEstimateSeconds: 480,
      order: 5,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_6',
      title: 'POST Endpoint',
      difficulty: 'intermediate' as Difficulty,
      tags: ['post', 'pydantic'],
      timeEstimateSeconds: 420,
      order: 6,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_7',
      title: 'Error Handling',
      difficulty: 'intermediate' as Difficulty,
      tags: ['errors', 'exceptions'],
      timeEstimateSeconds: 420,
      order: 7,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_8',
      title: 'Dependency Injection',
      difficulty: 'intermediate' as Difficulty,
      tags: ['dependency-injection', 'depends'],
      timeEstimateSeconds: 600,
      order: 8,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_9',
      title: 'Router Module',
      difficulty: 'advanced' as Difficulty,
      tags: ['routers', 'modules'],
      timeEstimateSeconds: 600,
      order: 9,
      status: 'not-attempted',
    },
    {
      _id: 'ch_fastapi_10',
      title: 'Full CRUD API',
      difficulty: 'advanced' as Difficulty,
      tags: ['crud', 'routers', 'models'],
      timeEstimateSeconds: 900,
      order: 10,
      status: 'not-attempted',
    },
  ],
};
