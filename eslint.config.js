const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginImport = require('eslint-plugin-import');
const globals = require('globals');

const noUnusedVarsConfig = [
  'error',
  {
    args: 'all',
    argsIgnorePattern: '^_',
    caughtErrors: 'all',
    caughtErrorsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    ignoreRestSiblings: true,
  },
];

module.exports = tseslint.config(
  {
    files: ['**/*.js'],
    ignores: ['dist/bundle.js', 'src/validate_language.js'],
    extends: [eslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
      semi: ['warn', 'always'],
      'comma-dangle': ['off'],
      'space-before-function-paren': ['off'],
      'no-unused-vars': noUnusedVarsConfig,
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['src/language.d.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      import: pluginImport,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
      'import/namespace': ['error'],
      'import/no-named-as-default': ['error'],
      'import/export': ['error'],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
    },
  }
);
