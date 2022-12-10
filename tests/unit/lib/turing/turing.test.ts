/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import {
  read_transition_table,
  tm_execute,
  print_tm,
  TableReadError,
} from "$lib/turing/tm";

describe("Transition tables", () => {
  it("Reads the header", async () => {
    const tm = read_transition_table(`q0 q1`).tm;
    expect(
      tm.start_state === "q0" &&
        tm.accept_states.has("q1") &&
        tm.accept_states.size === 1 &&
        tm.delta.size === 0,
    ).toEqual(true);
  });

  it("Reads a simple tm", () => {
    const tm = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a R q0
                                     q0 _ _ R q1`).tm;

    expect(
      tm.delta.size === 1 &&
        tm.delta.get("q0")?.get("a")?.write === "b" &&
        tm.delta.get("q0")?.get("a")?.move === "R" &&
        tm.delta.get("q0")?.get("a")?.next === "q0" &&
        tm.delta.get("q1") === undefined,
    ).toEqual(true);
  });

  it("Throws an error when a line has less than 5 items", () => {
    const result = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a q0
                                     q0 _ _ R q1`);
    expect(result.error).toEqual(TableReadError.InsufficientItems);
  });

  it("Throws an error when a move symbol is not R or L", () => {
    const result = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a x q0
                                     q0 _ _ R q1`);
    expect(result.error).toEqual(TableReadError.UnexpectedSymbol);
  });

  it("Throws an error when a transition ends in an undefined state", () => {
    const result = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a L q4
                                     q0 _ _ R q1`);
    expect(result.error).toEqual(TableReadError.UndefinedState);
  });

  it("Throws an error when a there is more than one transition from a state for the same read symbol", () => {
    const result = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 a a L q0
                                     q0 _ _ R q1`);
    expect(result.error).toEqual(TableReadError.AmbiguousTransitions);
  });
});

describe("Execution", () => {
  it("Reads and executes a simple tm", async () => {
    const tm = read_transition_table(
      `q0 q1
       q0 _ _ R q1`,
    ).tm;
    const result = tm_execute(tm, "");
    expect(result.accept).toEqual("ACCEPT");
    expect(result.on_tape).toEqual("");
  });

  it("Reads and executes a tm that 'nots' the input string", async () => {
    const tm = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a R q0
                                     q0 _ _ R q1`).tm;
    const result = tm_execute(tm, "ababaab");
    expect(result.accept).toEqual("ACCEPT");
    expect(result.on_tape).toEqual("bababba");
  });

  it("Rejects inputs with symbols not in the tm's delta", async () => {
    const tm = read_transition_table(`q0 q1
                                     q0 a b R q0
                                     q0 b a R q0
                                     q0 _ _ R q1`).tm;
    const result = tm_execute(tm, "abbxyy");
    expect(result.accept).toEqual("REJECT");
    expect(result.on_tape).toEqual("baaxyy");
  });

  it("Reads and executes a tm that accepts binary palindromes", async () => {
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
    const tm = read_transition_table(table).tm;
    expect(tm_execute(tm, "").accept).toEqual("ACCEPT");
    expect(tm_execute(tm, "xyyx").accept).toEqual("ACCEPT");
    expect(tm_execute(tm, "xyxy").accept).toEqual("REJECT");
    expect(tm_execute(tm, "x".repeat(100)).accept).toEqual("ACCEPT");
  });
});
