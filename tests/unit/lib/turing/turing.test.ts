/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import {read_transtion_table} from "$lib/turing/turing";

describe("Transision tables", () => {
  it("Reads the header", async () => {
    const tm = read_transtion_table(`q0 q1`);
    expect(tm.start_state === "q0" && tm.accept_states.has("q1"));
  });
});
