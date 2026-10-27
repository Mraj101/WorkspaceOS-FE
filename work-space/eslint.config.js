import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Architectural boundaries (see docs/ARCHITECTURE.md):
//   app      -> may import anything
//   modules  -> may import shared, services, and other modules' public index only
//   services -> may import shared only
//   shared   -> may import nothing above it
const deepModuleImport = {
  group: ['@/modules/*/*'],
  message: 'Import another module only through its public API: "@/modules/<name>".',
};
const appImport = {
  group: ['@/app', '@/app/*'],
  message: 'Only the app layer may import from "@/app".',
};
const moduleImport = {
  group: ['@/modules', '@/modules/*'],
  message: 'Shared code and infrastructure must not depend on business modules.',
};
const servicesImport = {
  group: ['@/services', '@/services/*'],
  message: 'shared/ must stay infrastructure-free; move this code to services/ or a module.',
};

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // `disabled || isLoading` on booleans is intentional: `false ?? true` would be wrong.
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { boolean: true } },
      ],
      // RTK Query's documented convention for argument-less endpoints is `build.query<T, void>`.
      '@typescript-eslint/no-invalid-void-type': 'off',
      'no-restricted-imports': ['error', { patterns: [deepModuleImport] }],
    },
  },
  {
    files: ['src/modules/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: [deepModuleImport, appImport] }] },
  },
  {
    files: ['src/services/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: [appImport, moduleImport] }] },
  },
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [appImport, moduleImport, servicesImport] }],
    },
  },
  {
    // Mock composition and test utilities may reach into module-owned mocks.
    files: ['src/mocks/**', 'src/test/**', '**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['*.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
]);
