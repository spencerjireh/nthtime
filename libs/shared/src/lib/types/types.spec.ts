import { FeedbackLevel, Difficulty } from './settings.js';
import type { Assertion, AssertionSet, Pack, UserSettings } from './index.js';

describe('FeedbackLevel enum', () => {
  it('has five levels from 0 to 4', () => {
    expect(FeedbackLevel.None).toBe(0);
    expect(FeedbackLevel.PassFail).toBe(1);
    expect(FeedbackLevel.Hints).toBe(2);
    expect(FeedbackLevel.AssertionDetails).toBe(3);
    expect(FeedbackLevel.FullDiagnostics).toBe(4);
  });
});

describe('Difficulty enum', () => {
  it('has three string values', () => {
    expect(Difficulty.Beginner).toBe('beginner');
    expect(Difficulty.Intermediate).toBe('intermediate');
    expect(Difficulty.Advanced).toBe('advanced');
  });
});

// Prevents TypeScript from narrowing the literal type at the call site
function identity<T>(value: T): T { return value; }

describe('type compilation', () => {
  it('Assertion discriminated union narrows correctly', () => {
    const assertion = identity<Assertion>({
      type: 'functionDeclaration',
      description: 'declares a function',
      name: 'greet',
      params: ['name'],
    });

    // Exhaustive narrowing via type field
    switch (assertion.type) {
      case 'functionDeclaration':
        expect(assertion.name).toBe('greet');
        break;
      case 'variableDeclaration':
      case 'importDeclaration':
      case 'exportDeclaration':
      case 'methodCall':
      case 'returnStatement':
      case 'classDeclaration':
      case 'jsxElement':
      case 'pythonFunctionDef':
      case 'pythonClassDef':
      case 'pythonImport':
      case 'sexpression':
        break;
      default: {
        const _exhaustive: never = assertion;
        throw new Error(`Unhandled assertion type: ${_exhaustive}`);
      }
    }
  });

  it('AssertionSet shape is valid', () => {
    const set: AssertionSet = {
      perFile: {
        'index.ts': [
          { type: 'importDeclaration', description: 'imports React', source: 'react' },
        ],
      },
      crossFile: [],
    };
    expect(Object.keys(set.perFile)).toHaveLength(1);
  });

  it('Pack references Challenge and FileEntry', () => {
    const pack: Pack = {
      name: 'Test Pack',
      slug: 'test-pack',
      description: 'A test pack',
      language: 'typescript',
      version: '1.0.0',
      author: 'test',
      tags: ['test'],
      challenges: [
        {
          id: 'c1',
          title: 'Challenge 1',
          prompt: 'Do something',
          difficulty: Difficulty.Beginner,
          tags: [],
          timeEstimateSeconds: 60,
          scaffolded: true,
          files: [{ path: 'index.ts', content: '' }],
          hints: [],
          assertions: { perFile: {}, crossFile: [] },
        },
      ],
    };
    expect(pack.challenges).toHaveLength(1);
  });

  it('UserSettings has all required fields', () => {
    const settings: UserSettings = {
      feedbackLevel: FeedbackLevel.Hints,
      difficulty: Difficulty.Intermediate,
      keybindings: 'vim',
      darkMode: true,
      formatter: {
        defaults: {
          enabled: true,
          trigger: 'onSave',
          tabSize: 2,
          useTabs: false,
        },
        overrides: {},
      },
    };
    expect(settings.feedbackLevel).toBe(FeedbackLevel.Hints);
  });
});
