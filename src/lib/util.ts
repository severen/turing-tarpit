/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Throw an error with an optional message if the condition is false.
 */
export function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}` || "Assertion failed");
  }
}
