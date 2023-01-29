/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { parse } from "$lib/lambda/parser";
import { mkAbs, mkApp, mkVar } from "$lib/lambda/syntax";

describe("λ-calculus Parser", () => {
  it("parses a single-letter variable", async () => {
    expect(parse("x")).toEqual(mkVar("x"));
  });

  it("parses a natural number", async () => {
    expect(parse("2")).toEqual(
      mkAbs("f", mkAbs("x", mkApp(mkVar("f"), mkApp(mkVar("f"), mkVar("x"))))),
    );
  });

  it("parses an abstraction", async () => {
    expect(parse("\\x -> x")).toEqual(mkAbs("x", mkVar("x")));
  });

  it("parses a nested abstraction", async () => {
    expect(parse("\\f -> \\x -> f")).toEqual(mkAbs("f", mkAbs("x", mkVar("f"))));
  });

  it("parses a multivariate abstraction", async () => {
    expect(parse("\\f x y -> f x y")).toEqual(
      mkAbs(
        "f",
        mkAbs("x", mkAbs("y", mkApp(mkApp(mkVar("f"), mkVar("x")), mkVar("y")))),
      ),
    );
  });

  it("parses a single application", async () => {
    expect(parse("f x")).toEqual(mkApp(mkVar("f"), mkVar("x")));
  });

  it("parses a chained application", async () => {
    expect(parse("f x y")).toEqual(mkApp(mkApp(mkVar("f"), mkVar("x")), mkVar("y")));
  });

  it("parses complex terms", async () => {
    expect(parse("f (g x)")).toEqual(mkApp(mkVar("f"), mkApp(mkVar("g"), mkVar("x"))));

    expect(parse("f (\\x -> f x)")).toEqual(
      mkApp(mkVar("f"), mkAbs("x", mkApp(mkVar("f"), mkVar("x")))),
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
