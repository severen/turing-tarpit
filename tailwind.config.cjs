/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: CC0-1.0
 */

module.exports = {
  content: ["./src/**/*.{html,svelte,js,ts}"],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [require("@catppuccin/tailwindcss")],
};
