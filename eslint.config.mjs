import tseslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['**/dist', '**/node_modules', '**/.next', '**/coverage'],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
        },
      ],
    },
  }
);
