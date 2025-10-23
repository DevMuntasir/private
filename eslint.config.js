// eslint.config.js
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...vue.configs['vue3-recommended']?.rules,
      ...tsPlugin.configs.recommended?.rules,

    "@typescript-eslint/no-explicit-any": "off"
  
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended?.rules,
      '@typescript-eslint/no-explicit-any': 'no',
    },
  },
];
