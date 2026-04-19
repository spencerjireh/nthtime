import { join } from 'node:path';
import ts from 'typescript';
import { writeChallengeToTmp } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '08-if-type.json');

describe('If<C, A, B>', () => {
  let tmpDir: string;
  let cleanup: () => void;

  beforeAll(() => {
    const tmp = writeChallengeToTmp(CHALLENGE);
    tmpDir = tmp.tmpDir;
    cleanup = tmp.cleanup;
  });

  afterAll(() => cleanup());

  it('reference solution type-checks cleanly', () => {
    const solutionPath = join(tmpDir, 'solution.ts');
    const program = ts.createProgram([solutionPath], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      module: ts.ModuleKind.NodeNext,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const errors = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error);
    if (errors.length > 0) {
      const messages = errors.map((d) =>
        ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      );
      throw new Error(`Type errors in solution.ts:\n${messages.join('\n')}`);
    }
    expect(errors.length).toBe(0);
  });
});
