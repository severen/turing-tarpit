/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { Parser } from "$lib/lambda/parser";
import { mkAbs, mkVar } from "$lib/lambda/syntax";

describe("Parser", () => {
  it("parses variables", async () => {
    const vs = ["f", "g", "h", "x", "y", "z", "α", "β", "γ", "foo"];
    for (const v of vs) {
      const parser = new Parser(v);
      expect(parser.parse()).toEqual(mkVar(v));
    }
  });

  it("parses abstractions", async () => {
    const fs = ["\\x -> x", "λx -> x"];
    for (const f of fs) {
      const parser = new Parser(f);
      expect(parser.parse()).toEqual(mkAbs("x", mkVar("x")));
    }
  });

  it("does not parse the empty string", async () => {
    const parser = new Parser("");
    expect(() => {
      parser.parse();
    }).toThrowErrorMatchingSnapshot();
  });
});
