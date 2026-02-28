import { DEFAULT_FEEDBACK, Difficulty } from './settings.js';
import type { Assertion, AssertionSet, FeedbackConfig, Pack, UserSettings } from './index.js';

describe('FeedbackConfig defaults', () => {
  it('has correct default values matching L3 behavior', () => {
    expect(DEFAULT_FEEDBACK).toEqual({
      showPassFail: true,
      showHints: true,
      showAssertionDetails: true,
      showDiff: false,
      showSolution: false,
    });
  });

  it('satisfies FeedbackConfig shape', () => {
    const config: FeedbackConfig = DEFAULT_FEEDBACK;
    expect(typeof config.showPassFail).toBe('boolean');
    expect(typeof config.showHints).toBe('boolean');
    expect(typeof config.showAssertionDetails).toBe('boolean');
    expect(typeof config.showDiff).toBe('boolean');
    expect(typeof config.showSolution).toBe('boolean');
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
          slug: 'challenge-1',
          title: 'Challenge 1',
          prompt: 'Do something',
          difficulty: Difficulty.Beginner,
          tags: [],
          timeEstimateSeconds: 60,
          hints: [],
          referenceSolution: [{ path: 'index.ts', content: '' }],
          assertions: { perFile: {}, crossFile: [] },
        },
      ],
    };
    expect(pack.challenges).toHaveLength(1);
  });

  it('UserSettings has all required fields', () => {
    const settings: UserSettings = {
      feedback: DEFAULT_FEEDBACK,
      difficulty: Difficulty.Intermediate,
      keybindings: 'vim',
      darkMode: true,
      autocomplete: true,
      fileStubs: true,
      formatter: {
        defaults: {
          enabled: true,
          trigger: 'onSave',
          tabSize: 2,
          useTabs: false,
        },
        overrides: {},
      },
      promptCollapsed: false,
    };
    expect(settings.feedback.showPassFail).toBe(true);
    expect(settings.feedback.showDiff).toBe(false);
  });
});
