/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type Term, mkVar } from "./syntax";

/** Parse a variable term. */
export function parseVar(input: string): Term | undefined {
  const reVar = /[a-zA-Z]\w*/;

  const matches = input.match(reVar);
  if (matches) {
    const ident = matches[0];
    return mkVar(ident);
  }
}
