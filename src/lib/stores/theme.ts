/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { get, readable, writable } from "svelte/store";

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

const defaultTheme = Theme.System;

/** The current website theme preference. */
export const theme = (() => {
  if (browser) {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const theme = writable(storedTheme || defaultTheme);

    // Keep local storage up to date with the user's preferences.
    theme.subscribe((newTheme) => localStorage.setItem("theme", newTheme));

    return theme;
  }

  // On the server, the theme only matters insofar as it is used for prerendering.
  return writable(defaultTheme);
})();

/** Whether the website theme is currently in dark mode or not. */
export const isDarkTheme = readable(
  browser && document.documentElement.classList.contains("dark"),
  (set) => {
    if (browser) {
      const matcher = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = ({ matches: isDark }: MediaQueryListEvent) => {
        if (get(theme) === Theme.System) {
          set(isDark);
        }
      };
      matcher.addEventListener("change", handleChange);

      const unsubscribe = theme.subscribe((newTheme) => {
        set(newTheme !== Theme.System ? newTheme === Theme.Dark : matcher.matches);
      });

      return () => {
        unsubscribe();
        matcher.removeEventListener("change", handleChange);
      };
    }
  },
);
