/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** Check if a string contains only alphabetic characters. */
export function isAlpha(s: string): boolean {
  for (let i = 0; i < s.length; ++i) {
    const code = s.charCodeAt(i);
    if (!(code > 64 && code < 91) && !(code > 96 && code < 123)) {
      return false;
    }
  }

  return true;
}
