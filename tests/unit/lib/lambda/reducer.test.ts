/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { parse } from "$lib/lambda/parser";
import { instantiate, reduce } from "$lib/lambda/reducer";
import { mkAbs, mkApp, mkBVar, mkFVar, type Abs } from "$lib/lambda/syntax";

describe("λ-term reducer", async () => {
  it("reduce 1", async () => {
    const t = parse("(\\x -> x) t");
    expect(reduce(t)).toEqual(parse("t"));
  });

  it("reduce 2", async () => {
    const t = parse("(\\x -> x) ((\\x -> x) (\\z -> (\\x -> x) z))");
    expect(reduce(t)).toEqual(parse("\\z -> z"));
  });

  it("reduce 3", async () => {
    // Should only halt for normal order reduction.
    const t = parse("(\\x -> z) ((\\w -> w w w) (\\w -> w w w))");
    expect(reduce(t)).toEqual(mkFVar("z"));
  });

  it("reduce sucks", async () => {
    // this was not working
    const t = parse("(\\x -> (\\f x -> f (f x)) x)");
    expect(reduce(t)).toEqual(
      mkAbs("x", mkAbs("x", mkApp(mkBVar(1), mkApp(mkBVar(1), mkBVar(0))))),
    );
  });

  it("reduce 2^2", async () => {
    const t = parse("(\\f x -> f (f x)) (\\f x -> f (f x))");
    expect(reduce(t)).toEqual(parse("\\f x -> f (f (f (f x)))"));
  });

  it("instantiate", async () => {
    const s = parse("\\a b c -> a b c k") as Abs;
    const t = parse("\\x y -> x y s") as Abs;
    expect(instantiate(s, t.body)).toEqual(
      mkAbs("y", mkApp(mkApp(s, mkBVar(0)), mkFVar("s"))),
    );
  });

  // it("instantiate in nested abstraction", async () => {
  //   const s = parse("\\f x -> f x") as Abs;
  //   const t = parse("\\f x -> f (f x)") as Abs;
  //   expect(instantiate(s, t.body)).toEqual(parse("\\f x -> f (f x)"));
  // });
});
