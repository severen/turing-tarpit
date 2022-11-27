/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { parse } from "$lib/lambda/parser";
import { mkAbs, mkApp, mkVar } from "$lib/lambda/syntax";

describe("λ-calculus Parser", () => {
  it("parses variables", async () => {
    const vs = ["f", "g", "h", "x", "y", "z", "foo"];
    for (const v of vs) {
      expect(parse(v)).toEqual(mkVar(v));
    }
  });

  it("parses abstractions", async () => {
    expect(parse("\\x -> x")).toEqual(mkAbs("x", mkVar("x")));
  });

  it("parses nested abstractions", async () => {
    expect(parse("\\f -> \\x -> f")).toEqual(mkAbs("f", mkAbs("x", mkVar("f"))));
  });

  it("parses applications", async () => {
    expect(parse("f x")).toEqual(mkApp(mkVar("f"), mkVar("x")));
  });

  it("parses more applications", async () => {
    expect(parse("f x y")).toEqual(mkApp(mkApp(mkVar("f"), mkVar("x")), mkVar("y")));
  });

  it("parses even more applications", async () => {
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
