import pluginJs from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['dist/**', '.tanstack/**'],
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
  pluginJs.configs.recommended,
  reactHooks.configs.flat.recommended,
  ...pluginQuery.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      'react-compiler': reactCompiler,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react-compiler/react-compiler': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'unknown', ['internal', 'parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '@/app/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/pages/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/widgets/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/entities/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/shared/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      'react/react-in-jsx-scope': 'off',
    },
  },
  // starter route + shared/ui는 컴포넌트 시연/회귀 검증면이라 키보드 핸들러 없이
  // 클릭만 보여주는 데모 케이스가 많다. 사용자 페이지에는 이 override를
  // 확장하지 말고, 실제 인터랙션 컴포넌트는 ARIA 패턴(tabIndex=0 + onKeyDown)을
  // 따라야 한다.
  {
    files: ['src/pages/starter/**/*.{ts,tsx}', 'src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },
];

