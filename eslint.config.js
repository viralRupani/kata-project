import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

/**
 * Shared flat config for both workspaces. TypeScript-aware (non-type-checked for
 * speed), browser + node globals, and Prettier last to disable stylistic clashes.
 */
export default tseslint.config(
  { ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/prisma/migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  prettier,
);
