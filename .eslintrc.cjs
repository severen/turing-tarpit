/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: CC0-1.0
 */

module.exports = {
  root: true,

  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  plugins: ["svelte3", "@typescript-eslint"],

  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },

  ignorePatterns: ["*.cjs"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],

  rules: {
    eqeqeq: 2,
    "prefer-arrow-callback": 2,
    "no-duplicate-imports": 2,
    "no-new-native-nonconstructor": 2,
    "no-param-reassign": 1,
  },
};
