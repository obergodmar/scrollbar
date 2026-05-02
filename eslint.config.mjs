import js from '@eslint/js';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default [
  { ignores: ['dist', 'eslint.config.mjs'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2020 },
      globals: { ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsEslint.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^@'], ['^(react)'], ['^'], ['^\\.']],
        },
      ],
    },
  },
];
