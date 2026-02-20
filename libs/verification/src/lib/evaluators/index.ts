import type Parser from 'web-tree-sitter';
import type { Assertion, AssertionResult, AssertionType } from '@nthtime/shared';
import { evaluateFunctionDeclaration } from './function-declaration.js';
import { evaluateVariableDeclaration } from './variable-declaration.js';
import { evaluateImportDeclaration } from './import-declaration.js';
import { evaluateExportDeclaration } from './export-declaration.js';
import { evaluateMethodCall } from './method-call.js';
import { evaluateReturnStatement } from './return-statement.js';
import { evaluateClassDeclaration } from './class-declaration.js';
import { evaluateJsxElement } from './jsx-element.js';
import { evaluatePythonFunctionDef } from './python-function-def.js';
import { evaluatePythonClassDef } from './python-class-def.js';
import { evaluatePythonImport } from './python-import.js';
import { evaluateSExpression } from './sexpression.js';

type EvaluatorFn = (
  tree: Parser.Tree,
  source: string,
  assertion: Assertion,
  file: string,
  language: Parser.Language,
) => AssertionResult;

/* eslint-disable @typescript-eslint/no-explicit-any */
const evaluators: Record<AssertionType, EvaluatorFn> = {
  functionDeclaration: (t, s, a, f) => evaluateFunctionDeclaration(t, s, a as any, f),
  variableDeclaration: (t, s, a, f) => evaluateVariableDeclaration(t, s, a as any, f),
  importDeclaration: (t, s, a, f) => evaluateImportDeclaration(t, s, a as any, f),
  exportDeclaration: (t, s, a, f) => evaluateExportDeclaration(t, s, a as any, f),
  methodCall: (t, s, a, f) => evaluateMethodCall(t, s, a as any, f),
  returnStatement: (t, s, a, f) => evaluateReturnStatement(t, s, a as any, f),
  classDeclaration: (t, s, a, f) => evaluateClassDeclaration(t, s, a as any, f),
  jsxElement: (t, s, a, f) => evaluateJsxElement(t, s, a as any, f),
  pythonFunctionDef: (t, s, a, f) => evaluatePythonFunctionDef(t, s, a as any, f),
  pythonClassDef: (t, s, a, f) => evaluatePythonClassDef(t, s, a as any, f),
  pythonImport: (t, s, a, f) => evaluatePythonImport(t, s, a as any, f),
  sexpression: (t, s, a, f, l) => evaluateSExpression(t, s, a as any, f, l),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function evaluateAssertion(
  tree: Parser.Tree,
  source: string,
  assertion: Assertion,
  file: string,
  language: Parser.Language,
): AssertionResult {
  const evaluator = evaluators[assertion.type];
  if (!evaluator) {
    return {
      assertion,
      passed: false,
      message: `Unknown assertion type: ${assertion.type}`,
      location: { file, line: 0, column: 0 },
    };
  }
  return evaluator(tree, source, assertion, file, language);
}
