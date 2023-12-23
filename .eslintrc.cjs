/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: CC0-1.0
 */

module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "plugin:svelte/prettier",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },

  ignorePatterns: ["*.cjs"],
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],

  env: {
    browser: true,
    es2017: true,
    node: true,
  },

  rules: {
    eqeqeq: 2,
    "prefer-arrow-callback": 2,
    "no-duplicate-imports": 2,
    "no-new-native-nonconstructor": 2,
    "no-param-reassign": 1,
  },
};
