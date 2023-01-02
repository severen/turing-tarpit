/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { parse } from "$lib/lambda/parser";
import { debugPrint, mkBVar, mkFVar, prettyPrint } from "$lib/lambda/syntax";

describe("λ-term syntax", async () => {
  describe("debug printer", async () => {
    it("correctly prints free variables", async () => {
      const name = "x";
      expect(debugPrint(mkFVar(name))).toEqual(name);
    });

    it("correctly prints bound variables", async () => {
      const index = 3;
      expect(debugPrint(mkBVar(3))).toEqual(index.toString());
    });

    it("correctly prints closed abstractions", async () => {
      const t = parse("\\x -> x");
      expect(debugPrint(t)).toEqual("(λx -> 0)");
    });

    it("correctly prints open abstractions", async () => {
      const t = parse("\\x -> y");
      expect(debugPrint(t)).toEqual("(λx -> y)");
    });

    it("correctly prints applications", async () => {
      const s = parse("f x");
      expect(debugPrint(s)).toEqual("(f x)");

      const t = parse("(\\x -> x) t");
      expect(debugPrint(t)).toEqual("((λx -> 0) t)");
    });
  });

  describe("pretty printer", async () => {
    it("correctly prints free variables", async () => {
      const name = "x";
      expect(prettyPrint(mkFVar(name))).toEqual(name);
    });

    it("correctly prints closed abstractions", async () => {
      const t = parse("\\x -> x");
      expect(prettyPrint(t)).toEqual("λx -> x");
    });

    it("correctly prints open abstractions", async () => {
      const t = parse("\\x -> y");
      expect(prettyPrint(t)).toEqual("λx -> y");
    });

    it("correctly prints applications", async () => {
      const t1 = parse("f x");
      expect(prettyPrint(t1)).toEqual("f x");

      const t2 = parse("(\\x -> x) t");
      expect(prettyPrint(t2)).toEqual("(λx -> x) t");

      const t3 = parse("(\\f x -> f (f x)) (\\f x -> f (f x))");
      expect(prettyPrint(t3)).toEqual("(λf -> λx -> f (f x)) (λf -> λx -> f (f x))");

      const t4 = parse("(\\x -> x) (x y z)");
      expect(prettyPrint(t4)).toEqual("(λx -> x) (x y z)");
    });
  });
});
