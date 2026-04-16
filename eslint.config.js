import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-alert': 'error',

      'no-shadow': 'warn',
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
        },
      ],
      'prefer-template': 'error',
      'prefer-arrow-callback': 'warn',
      'no-duplicate-imports': 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '.git/**'],
  },
];
