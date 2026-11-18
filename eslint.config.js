// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*', 'coverage/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // CLAUDE.md §5: no `any`.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // CLAUDE.md §1.2 / §4.2: only src/db may touch SQLite. Everything else uses useDb() + repositories.
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['src/db/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'expo-sqlite',
              message: 'Open the database only through src/db (CLAUDE.md §1.2).',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      // CLAUDE.md §1.3: never log health data. Use console.warn/error for IDs/counts only.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // CLAUDE.md §1.1: no network.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'No network access in this app (CLAUDE.md §1).' },
        { name: 'XMLHttpRequest', message: 'No network access in this app (CLAUDE.md §1).' },
        { name: 'WebSocket', message: 'No network access in this app (CLAUDE.md §1).' },
      ],
    },
  },
]);
