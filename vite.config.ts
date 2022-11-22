/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: CC0-1.0
 */

import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

const config = defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});

export default config;
