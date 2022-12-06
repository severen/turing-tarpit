/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { read_transtion_table, tm_execute } from "$lib/turing/turing";

describe("Transision tables", () => {
  it("Reads the header", async () => {
    const tm = read_transtion_table(`q0 q1`);
    expect(
      tm.start_state === "q0" &&
        tm.accept_states.has("q1") &&
        tm.accept_states.size === 1 &&
        tm.delta.size === 0,
    ).toEqual(true);
  });

  it("Reads a simple tm", () => {
    const tm = read_transtion_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a R q0
                                     q0 _ _ R q1`);
    expect(
      tm.delta.size === 1 &&
        tm.delta.get("q0")?.get("a")?.write === "b" &&
        tm.delta.get("q0")?.get("a")?.move === "R" &&
        tm.delta.get("q0")?.get("a")?.next === "q0" &&
        tm.delta.get("q1") === undefined,
    ).toEqual(true);
  });
});

describe("Execution", () => {
  it("Reads and executes a simple tm", async () => {
    const tm = read_transtion_table(
      `q0 q1
       q0 _ _ R q1`,
    );
    const result = tm_execute(tm, "");
    expect(result.accept).toEqual("ACCEPT");
    expect(result.on_tape).toEqual("");
  });

  it("Reads and executes a tm that 'nots' the input string", async () => {
    const tm = read_transtion_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a R q0
                                     q0 _ _ R q1`);
    const result = tm_execute(tm, "ababaab");
    expect(result.accept).toEqual("ACCEPT");
    expect(result.on_tape).toEqual("bababba");
  });

  it("Rejects inputs with symbols not in the tm's delta", async () => {
    const tm = read_transtion_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a R q0
                                     q0 _ _ R q1`);
    const result = tm_execute(tm, "abbxyy");
    expect(result.accept).toEqual("REJECT");
    expect(result.on_tape).toEqual("baaxyy");
  });

  it("Read and executes a tm that accepts binary palindromes", async () => {
    const table = `q0 q6
                   q0 x _ R q1
                   q0 _ _ R q6
                   q1 x x R q1
                   q1 y y R q1
                   q1 _ _ L q2
                   q2 x _ L q3
                   q3 x x L q3
                   q3 y y L q3
                   q3 _ _ R q0
                   q0 y _ R q4
                   q4 x x R q4
                   q4 y y R q4
                   q4 _ _ L q5
                   q5 y _ L q3`;
    const tm = read_transtion_table(table);
    expect(tm_execute(tm, "").accept).toEqual("ACCEPT");
    expect(tm_execute(tm, "xyyx").accept).toEqual("ACCEPT");
    expect(tm_execute(tm, "xyxy").accept).toEqual("REJECT");
    expect(tm_execute(tm, "x".repeat(100)).accept).toEqual("ACCEPT");
  });
});
