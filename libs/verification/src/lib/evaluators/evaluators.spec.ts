import { describe, it, expect, beforeAll } from 'vitest';
import Parser from 'web-tree-sitter';
import { loadLanguage, createParser } from '../grammar-loader.js';
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

let jsParser: Parser;
let pyParser: Parser;
let jsonParser: Parser;
let jsLang: Parser.Language;
let jsonLang: Parser.Language;

function parseJS(code: string): Parser.Tree {
  return jsParser.parse(code);
}

function parsePY(code: string): Parser.Tree {
  return pyParser.parse(code);
}

function parseJSON(code: string): Parser.Tree {
  return jsonParser.parse(code);
}

beforeAll(async () => {
  jsParser = await createParser('javascript');
  pyParser = await createParser('python');
  jsonParser = await createParser('json');
  jsLang = await loadLanguage('javascript');
  jsonLang = await loadLanguage('json');
});

describe('functionDeclaration evaluator', () => {
  it('finds a named function declaration', () => {
    const tree = parseJS('function hello() {}');
    const result = evaluateFunctionDeclaration(
      tree, '', { type: 'functionDeclaration', name: 'hello', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when function not found', () => {
    const tree = parseJS('function other() {}');
    const result = evaluateFunctionDeclaration(
      tree, '', { type: 'functionDeclaration', name: 'hello', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });

  it('finds an arrow function assigned to a const', () => {
    const tree = parseJS('const greet = () => {}');
    const result = evaluateFunctionDeclaration(
      tree, '', { type: 'functionDeclaration', name: 'greet', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('checks async correctly', () => {
    const tree = parseJS('async function fetchData() {}');
    const result = evaluateFunctionDeclaration(
      tree, '', { type: 'functionDeclaration', name: 'fetchData', async: true, description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('checks params', () => {
    const tree = parseJS('function add(a, b) { return a + b; }');
    const result = evaluateFunctionDeclaration(
      tree, '', { type: 'functionDeclaration', name: 'add', params: ['a', 'b'], description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });
});

describe('variableDeclaration evaluator', () => {
  it('finds a const declaration', () => {
    const tree = parseJS('const PORT = 3000;');
    const result = evaluateVariableDeclaration(
      tree, '', { type: 'variableDeclaration', name: 'PORT', kind: 'const', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when kind mismatches', () => {
    const tree = parseJS('let PORT = 3000;');
    const result = evaluateVariableDeclaration(
      tree, '', { type: 'variableDeclaration', name: 'PORT', kind: 'const', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });

  it('fails when variable not found', () => {
    const tree = parseJS('const OTHER = 42;');
    const result = evaluateVariableDeclaration(
      tree, '', { type: 'variableDeclaration', name: 'PORT', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });
});

describe('importDeclaration evaluator', () => {
  it('finds an import statement', () => {
    const tree = parseJS("import express from 'express';");
    const result = evaluateImportDeclaration(
      tree, '', { type: 'importDeclaration', source: 'express', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('checks specifiers', () => {
    const tree = parseJS("import { Router, json } from 'express';");
    const result = evaluateImportDeclaration(
      tree, '', { type: 'importDeclaration', source: 'express', specifiers: ['Router'], description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails for missing source', () => {
    const tree = parseJS("import foo from 'bar';");
    const result = evaluateImportDeclaration(
      tree, '', { type: 'importDeclaration', source: 'express', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });
});

describe('exportDeclaration evaluator', () => {
  it('finds a named export', () => {
    const tree = parseJS('export function handler() {}');
    const result = evaluateExportDeclaration(
      tree, '', { type: 'exportDeclaration', name: 'handler', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('finds a default export', () => {
    const tree = parseJS('export default function app() {}');
    const result = evaluateExportDeclaration(
      tree, '', { type: 'exportDeclaration', name: 'app', isDefault: true, description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when export not found', () => {
    const tree = parseJS('function notExported() {}');
    const result = evaluateExportDeclaration(
      tree, '', { type: 'exportDeclaration', name: 'notExported', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });
});

describe('methodCall evaluator', () => {
  it('finds a method call with object', () => {
    const tree = parseJS("app.get('/api', handler);");
    const result = evaluateMethodCall(
      tree, '', { type: 'methodCall', object: 'app', method: 'get', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('checks arguments', () => {
    const tree = parseJS("app.use(express.json());");
    const result = evaluateMethodCall(
      tree, '', { type: 'methodCall', object: 'app', method: 'use', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when method not found', () => {
    const tree = parseJS("app.post('/api', handler);");
    const result = evaluateMethodCall(
      tree, '', { type: 'methodCall', object: 'app', method: 'get', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });
});

describe('returnStatement evaluator', () => {
  it('finds a return statement', () => {
    const tree = parseJS('function f() { return 42; }');
    const result = evaluateReturnStatement(
      tree, '', { type: 'returnStatement', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('matches value pattern', () => {
    const tree = parseJS('function f() { return res.json({ ok: true }); }');
    const result = evaluateReturnStatement(
      tree, '', { type: 'returnStatement', valuePattern: 'res\\.json', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when no return found', () => {
    const tree = parseJS('function f() { console.log("hi"); }');
    const result = evaluateReturnStatement(
      tree, '', { type: 'returnStatement', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });
});

describe('classDeclaration evaluator', () => {
  it('finds a class', () => {
    const tree = parseJS('class MyApp {}');
    const result = evaluateClassDeclaration(
      tree, '', { type: 'classDeclaration', name: 'MyApp', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('checks extends', () => {
    const tree = parseJS('class MyApp extends BaseApp {}');
    const result = evaluateClassDeclaration(
      tree, '', { type: 'classDeclaration', name: 'MyApp', extends: 'BaseApp', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when class not found', () => {
    const tree = parseJS('const obj = {};');
    const result = evaluateClassDeclaration(
      tree, '', { type: 'classDeclaration', name: 'MyApp', description: 'test' }, 'test.js',
    );
    expect(result.passed).toBe(false);
  });
});

describe('jsxElement evaluator', () => {
  it('finds a JSX element', () => {
    const tree = parseJS('const el = <Button>Click</Button>;');
    const result = evaluateJsxElement(
      tree, '', { type: 'jsxElement', name: 'Button', description: 'test' }, 'test.jsx',
    );
    expect(result.passed).toBe(true);
  });

  it('checks props', () => {
    const tree = parseJS('const el = <Button variant="primary" onClick={fn}>Go</Button>;');
    const result = evaluateJsxElement(
      tree, '', { type: 'jsxElement', name: 'Button', props: ['variant', 'onClick'], description: 'test' }, 'test.jsx',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when element not found', () => {
    const tree = parseJS('const el = <div>text</div>;');
    const result = evaluateJsxElement(
      tree, '', { type: 'jsxElement', name: 'Button', description: 'test' }, 'test.jsx',
    );
    expect(result.passed).toBe(false);
  });
});

describe('pythonFunctionDef evaluator', () => {
  it('finds a function', () => {
    const tree = parsePY('def hello():\n    pass');
    const result = evaluatePythonFunctionDef(
      tree, '', { type: 'pythonFunctionDef', name: 'hello', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(true);
  });

  it('checks decorator', () => {
    const tree = parsePY('@app.get("/")\ndef index():\n    return "ok"');
    const result = evaluatePythonFunctionDef(
      tree, '', { type: 'pythonFunctionDef', name: 'index', decorator: 'app.get', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when function not found', () => {
    const tree = parsePY('def other():\n    pass');
    const result = evaluatePythonFunctionDef(
      tree, '', { type: 'pythonFunctionDef', name: 'hello', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(false);
  });
});

describe('pythonClassDef evaluator', () => {
  it('finds a class', () => {
    const tree = parsePY('class MyModel:\n    pass');
    const result = evaluatePythonClassDef(
      tree, '', { type: 'pythonClassDef', name: 'MyModel', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(true);
  });

  it('checks base classes', () => {
    const tree = parsePY('class MyModel(BaseModel):\n    name: str');
    const result = evaluatePythonClassDef(
      tree, '', { type: 'pythonClassDef', name: 'MyModel', bases: ['BaseModel'], description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when class not found', () => {
    const tree = parsePY('x = 1');
    const result = evaluatePythonClassDef(
      tree, '', { type: 'pythonClassDef', name: 'MyModel', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(false);
  });
});

describe('pythonImport evaluator', () => {
  it('finds a from-import', () => {
    const tree = parsePY('from fastapi import FastAPI');
    const result = evaluatePythonImport(
      tree, '', { type: 'pythonImport', module: 'fastapi', names: ['FastAPI'], description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(true);
  });

  it('finds a plain import', () => {
    const tree = parsePY('import os');
    const result = evaluatePythonImport(
      tree, '', { type: 'pythonImport', module: 'os', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(true);
  });

  it('fails when import not found', () => {
    const tree = parsePY('import sys');
    const result = evaluatePythonImport(
      tree, '', { type: 'pythonImport', module: 'os', description: 'test' }, 'test.py',
    );
    expect(result.passed).toBe(false);
  });
});

describe('sexpression evaluator', () => {
  it('matches a pattern', () => {
    const tree = parseJS('const x = 42;');
    const result = evaluateSExpression(
      tree, '', { type: 'sexpression', pattern: '(variable_declarator name: (identifier) @name)', description: 'test' }, 'test.js', jsLang,
    );
    expect(result.passed).toBe(true);
  });

  it('fails when pattern does not match', () => {
    const tree = parseJS('console.log("hello");');
    const result = evaluateSExpression(
      tree, '', { type: 'sexpression', pattern: '(class_declaration name: (identifier) @name)', description: 'test' }, 'test.js', jsLang,
    );
    expect(result.passed).toBe(false);
  });

  it('matches a JSON object with string key-value pairs', () => {
    const tree = parseJSON('{"name": "nthtime", "version": "1.0.0"}');
    const result = evaluateSExpression(
      tree, '', { type: 'sexpression', pattern: '(pair key: (string) @key)', description: 'test' }, 'data.json', jsonLang,
    );
    expect(result.passed).toBe(true);
  });

  it('matches a JSON array', () => {
    const tree = parseJSON('[1, 2, 3]');
    const result = evaluateSExpression(
      tree, '', { type: 'sexpression', pattern: '(array (number) @num)', description: 'test' }, 'data.json', jsonLang,
    );
    expect(result.passed).toBe(true);
  });
});
