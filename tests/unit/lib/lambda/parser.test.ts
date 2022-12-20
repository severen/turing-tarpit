/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { parse } from "$lib/lambda/parser";
import { mkAbs, mkApp, mkBVar, mkFVar } from "$lib/lambda/syntax";

describe("λ-term parser", async () => {
  it("parses a variable", async () => {
    expect(parse("x")).toEqual(mkFVar("x"));
  });

  it("parses a bracketed variable", async () => {
    expect(parse("(x)")).toEqual(mkFVar("x"));
  });

  it("parses a closed abstraction", async () => {
    expect(parse("\\x -> x")).toEqual(mkAbs("x", mkBVar(0)));
  });

  it("parses an open abstraction", async () => {
    expect(parse("\\x -> y")).toEqual(mkAbs("x", mkFVar("y")));
  });

  it("parses a nested closed abstraction", async () => {
    expect(parse("\\x -> \\x -> x")).toEqual(mkAbs("x", mkAbs("x", mkBVar(0))));
  });

  it("parses a nested open abstraction", async () => {
    expect(parse("\\f -> \\g -> t")).toEqual(mkAbs("f", mkAbs("g", mkFVar("t"))));
  });

  it("parses a multivariate abstraction", async () => {
    const t = parse("\\f x y -> f x y");
    expect(t).toEqual(
      mkAbs("f", mkAbs("x", mkAbs("y", mkApp(mkApp(mkBVar(2), mkBVar(1)), mkBVar(0))))),
    );
    expect(t).toEqual(parse("\\f -> \\x -> \\y -> f x y"));
  });

  it("parses a bracketed abstraction", async () => {
    expect(parse("(\\s -> t)")).toEqual(mkAbs("s", mkFVar("t")));
  });

  it("parses a single application", async () => {
    expect(parse("f x")).toEqual(mkApp(mkFVar("f"), mkFVar("x")));
  });

  it("parses a chained application", async () => {
    expect(parse("f x y")).toEqual(mkApp(mkApp(mkFVar("f"), mkFVar("x")), mkFVar("y")));
  });

  it("parses a bracketed application", async () => {
    expect(parse("f (g x)")).toEqual(
      mkApp(mkFVar("f"), mkApp(mkFVar("g"), mkFVar("x"))),
    );
  });

  it("parses a complex term", async () => {
    expect(parse("(\\x -> x) (\\y -> (\\z -> z k) y)")).toEqual(
      mkApp(
        mkAbs("x", mkBVar(0)),
        mkAbs("y", mkApp(mkAbs("z", mkApp(mkBVar(0), mkFVar("k"))), mkBVar(0))),
      ),
    );
  });

  it("does not parse the empty string", async () => {
    expect(() => {
      parse("");
    }).toThrowErrorMatchingSnapshot();
  });

  it("consumes the entire input", async () => {
    expect(() => {
      parse("this is a valid term but ; is not");
    }).toThrowErrorMatchingSnapshot();
  });
});
