import type { Assertion } from '@nthtime/shared';

/**
 * Formats type-specific assertion fields into a readable technical detail string.
 * Used in the challenge detail view to show what each assertion checks.
 */
export function getAssertionTechnicalDetail(assertion: Assertion): string {
  switch (assertion.type) {
    case 'functionDeclaration': {
      const params = assertion.params?.join(', ') ?? '';
      const prefix = assertion.async ? 'async ' : '';
      return `${prefix}function ${assertion.name}(${params})`;
    }
    case 'variableDeclaration': {
      const kind = assertion.kind ?? 'const';
      return `${kind} ${assertion.name}`;
    }
    case 'importDeclaration': {
      const specifiers = assertion.specifiers?.length
        ? `{ ${assertion.specifiers.join(', ')} }`
        : '*';
      return `import ${specifiers} from '${assertion.source}'`;
    }
    case 'exportDeclaration': {
      const keyword = assertion.isDefault ? 'default' : 'named';
      return `export (${keyword}) ${assertion.name}`;
    }
    case 'methodCall': {
      const obj = assertion.object ? `${assertion.object}.` : '';
      const args = assertion.args?.join(', ') ?? '';
      return `${obj}${assertion.method}(${args})`;
    }
    case 'returnStatement': {
      return assertion.valuePattern
        ? `return matching /${assertion.valuePattern}/`
        : 'return statement';
    }
    case 'classDeclaration': {
      let detail = `class ${assertion.name}`;
      if (assertion.extends) detail += ` extends ${assertion.extends}`;
      if (assertion.implements?.length) {
        detail += ` implements ${assertion.implements.join(', ')}`;
      }
      return detail;
    }
    case 'jsxElement': {
      const props = assertion.props?.length ? ` ${assertion.props.join(' ')}` : '';
      return `<${assertion.name}${props} />`;
    }
    case 'pythonFunctionDef': {
      const params = assertion.params?.join(', ') ?? '';
      const decorator = assertion.decorator ? `@${assertion.decorator} ` : '';
      return `${decorator}def ${assertion.name}(${params})`;
    }
    case 'pythonClassDef': {
      const bases = assertion.bases?.length ? `(${assertion.bases.join(', ')})` : '';
      return `class ${assertion.name}${bases}`;
    }
    case 'pythonImport': {
      const names = assertion.names?.length
        ? `${assertion.names.join(', ')} from `
        : '';
      return `import ${names}${assertion.module}`;
    }
    case 'sexpression':
      return assertion.pattern;
    default: {
      const _exhaustive: never = assertion;
      return _exhaustive;
    }
  }
}
