/**
 * Per-assertion-type JSON templates for the assertion snippet palette.
 * Each template has placeholder values the author can customize.
 */
export const ASSERTION_SNIPPETS = [
  {
    label: 'Function',
    type: 'functionDeclaration',
    template: {
      type: 'functionDeclaration',
      description: 'Declares a function',
      name: 'myFunction',
      params: ['param1'],
      async: false,
    },
  },
  {
    label: 'Variable',
    type: 'variableDeclaration',
    template: {
      type: 'variableDeclaration',
      description: 'Declares a variable',
      name: 'myVariable',
      kind: 'const',
    },
  },
  {
    label: 'Import',
    type: 'importDeclaration',
    template: {
      type: 'importDeclaration',
      description: 'Imports a module',
      source: 'module-name',
      specifiers: ['named'],
    },
  },
  {
    label: 'Export',
    type: 'exportDeclaration',
    template: {
      type: 'exportDeclaration',
      description: 'Exports a declaration',
      name: 'myExport',
      isDefault: false,
    },
  },
  {
    label: 'Method Call',
    type: 'methodCall',
    template: {
      type: 'methodCall',
      description: 'Calls a method',
      object: 'obj',
      method: 'method',
    },
  },
  {
    label: 'Return',
    type: 'returnStatement',
    template: {
      type: 'returnStatement',
      description: 'Returns a value',
      valuePattern: '.*',
    },
  },
  {
    label: 'Class',
    type: 'classDeclaration',
    template: {
      type: 'classDeclaration',
      description: 'Declares a class',
      name: 'MyClass',
    },
  },
  {
    label: 'JSX Element',
    type: 'jsxElement',
    template: {
      type: 'jsxElement',
      description: 'Renders a JSX element',
      name: 'Component',
      props: ['prop1'],
    },
  },
  {
    label: 'Python Fn',
    type: 'pythonFunctionDef',
    template: {
      type: 'pythonFunctionDef',
      description: 'Defines a Python function',
      name: 'my_function',
      params: ['param1'],
    },
  },
  {
    label: 'Python Class',
    type: 'pythonClassDef',
    template: {
      type: 'pythonClassDef',
      description: 'Defines a Python class',
      name: 'MyClass',
    },
  },
  {
    label: 'Python Import',
    type: 'pythonImport',
    template: {
      type: 'pythonImport',
      description: 'Imports a Python module',
      module: 'module_name',
    },
  },
  {
    label: 'S-Expression',
    type: 'sexpression',
    template: {
      type: 'sexpression',
      description: 'Matches a tree-sitter pattern',
      pattern: '(identifier) @name',
    },
  },
] as const;
