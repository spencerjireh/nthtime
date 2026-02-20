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
    challengeCount: 3,
    passedCount: 0,
  },
  {
    _id: 'pack_react',
    name: 'React Hooks',
    slug: 'react-hooks',
    description:
      'Master React hooks -- useState, useEffect, custom hooks, and composition patterns.',
    language: 'typescript',
    framework: 'react',
    version: '1.0.0',
    author: 'nthtime',
    tags: ['frontend', 'hooks', 'components'],
    challengeCount: 4,
    passedCount: 0,
  },
  {
    _id: 'pack_python',
    name: 'Python Fundamentals',
    slug: 'python-fundamentals',
    description:
      'Core Python patterns -- functions, classes, decorators, and comprehensions.',
    language: 'python',
    version: '1.0.0',
    author: 'nthtime',
    tags: ['scripting', 'oop', 'functional'],
    challengeCount: 3,
    passedCount: 0,
  },
];

export const MOCK_CHALLENGES: Record<string, MockChallenge[]> = {
  'express-basics': [
    {
      _id: 'ch_express_1',
      title: 'Hello World Server',
      difficulty: 'beginner' as Difficulty,
      tags: ['routes', 'get'],
      timeEstimateSeconds: 300,
      order: 1,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_2',
      title: 'Route Parameters',
      difficulty: 'beginner' as Difficulty,
      tags: ['routes', 'params'],
      timeEstimateSeconds: 300,
      order: 2,
      status: 'not-attempted',
    },
    {
      _id: 'ch_express_3',
      title: 'Error Handling Middleware',
      difficulty: 'intermediate' as Difficulty,
      tags: ['middleware', 'errors'],
      timeEstimateSeconds: 600,
      order: 3,
      status: 'not-attempted',
    },
  ],
  'react-hooks': [
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
      title: 'Fetch Data with useEffect',
      difficulty: 'beginner' as Difficulty,
      tags: ['useEffect', 'async'],
      timeEstimateSeconds: 300,
      order: 2,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_3',
      title: 'Custom useLocalStorage Hook',
      difficulty: 'intermediate' as Difficulty,
      tags: ['custom-hooks', 'localStorage'],
      timeEstimateSeconds: 600,
      order: 3,
      status: 'not-attempted',
    },
    {
      _id: 'ch_react_4',
      title: 'Debounced Search Input',
      difficulty: 'advanced' as Difficulty,
      tags: ['custom-hooks', 'performance'],
      timeEstimateSeconds: 900,
      order: 4,
      status: 'not-attempted',
    },
  ],
  'python-fundamentals': [
    {
      _id: 'ch_python_1',
      title: 'List Comprehension Filter',
      difficulty: 'beginner' as Difficulty,
      tags: ['comprehensions', 'lists'],
      timeEstimateSeconds: 300,
      order: 1,
      status: 'not-attempted',
    },
    {
      _id: 'ch_python_2',
      title: 'Class with Dunder Methods',
      difficulty: 'intermediate' as Difficulty,
      tags: ['oop', 'dunder'],
      timeEstimateSeconds: 600,
      order: 2,
      status: 'not-attempted',
    },
    {
      _id: 'ch_python_3',
      title: 'Decorator with Arguments',
      difficulty: 'advanced' as Difficulty,
      tags: ['decorators', 'closures'],
      timeEstimateSeconds: 900,
      order: 3,
      status: 'not-attempted',
    },
  ],
};
