/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { writable } from "svelte/store";

import { browser } from "$app/environment";

/** The set of possible theme preferences. */
export enum Theme {
  /** Follow the system theme preference. */
  System = "system",
  /** Prefer a light theme. */
  Light = "light",
  /** Prefer a dark theme. */
  Dark = "dark",
}

const storedTheme = browser ? (localStorage.getItem("theme") as Theme | null) : null;

/** The current website theme. */
export const theme = writable(storedTheme || Theme.System);
if (browser) {
  // Keep local storage up to date with the user's preferences.
  theme.subscribe((newTheme) => localStorage.setItem("theme", newTheme));
}
