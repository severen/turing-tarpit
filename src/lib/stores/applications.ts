/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { readable } from "svelte/store";

/** Application information. */
export const applications = readable([
  {
    name: "λ-calculus",
    description: "create and test λ-calculus programs",
    url: "/lambda",
  },
  {
    name: "Turing Machines",
    description: "create and test Turing machines",
    url: "/turing",
  },
  { name: "Automata", description: "create and test automata", url: "/automata" },
]);
