interface AssertionBase {
  readonly description: string;
  readonly hint?: string;
}

export interface FunctionDeclarationAssertion extends AssertionBase {
  readonly type: 'functionDeclaration';
  readonly name: string;
  readonly params?: readonly string[];
  readonly async?: boolean;
}

export interface VariableDeclarationAssertion extends AssertionBase {
  readonly type: 'variableDeclaration';
  readonly name: string;
  readonly kind?: 'const' | 'let' | 'var';
}

export interface ImportDeclarationAssertion extends AssertionBase {
  readonly type: 'importDeclaration';
  readonly source: string;
  readonly specifiers?: readonly string[];
}

export interface ExportDeclarationAssertion extends AssertionBase {
  readonly type: 'exportDeclaration';
  readonly name: string;
  readonly isDefault?: boolean;
}

export interface MethodCallAssertion extends AssertionBase {
  readonly type: 'methodCall';
  readonly object?: string;
  readonly method: string;
  readonly args?: readonly string[];
}

export interface ReturnStatementAssertion extends AssertionBase {
  readonly type: 'returnStatement';
  readonly valuePattern?: string;
}

export interface ClassDeclarationAssertion extends AssertionBase {
  readonly type: 'classDeclaration';
  readonly name: string;
  readonly extends?: string;
  readonly implements?: readonly string[];
}

export interface JsxElementAssertion extends AssertionBase {
  readonly type: 'jsxElement';
  readonly name: string;
  readonly props?: readonly string[];
}

export interface PythonFunctionDefAssertion extends AssertionBase {
  readonly type: 'pythonFunctionDef';
  readonly name: string;
  readonly params?: readonly string[];
  readonly decorator?: string;
}

export interface PythonClassDefAssertion extends AssertionBase {
  readonly type: 'pythonClassDef';
  readonly name: string;
  readonly bases?: readonly string[];
}

export interface PythonImportAssertion extends AssertionBase {
  readonly type: 'pythonImport';
  readonly module: string;
  readonly names?: readonly string[];
}

export interface SExpressionAssertion extends AssertionBase {
  readonly type: 'sexpression';
  readonly pattern: string;
}

export type Assertion =
  | FunctionDeclarationAssertion
  | VariableDeclarationAssertion
  | ImportDeclarationAssertion
  | ExportDeclarationAssertion
  | MethodCallAssertion
  | ReturnStatementAssertion
  | ClassDeclarationAssertion
  | JsxElementAssertion
  | PythonFunctionDefAssertion
  | PythonClassDefAssertion
  | PythonImportAssertion
  | SExpressionAssertion;

export type AssertionType = Assertion['type'];

export interface AssertionSet {
  readonly perFile: Readonly<Record<string, readonly Assertion[]>>;
  readonly crossFile: readonly Assertion[];
}
