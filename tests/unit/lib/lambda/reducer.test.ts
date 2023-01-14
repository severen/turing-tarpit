/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, test } from "vitest";

import { parse } from "$lib/lambda/parser";
import { reduce } from "$lib/lambda/reducer";

describe("function reduce(t: Term): Term", async () => {
  // TODO: Run these tests for each available strategy.
  describe("any strategy", async () => {
    test("reduce((λx -> x) t) = t", async () => {
      const t = parse("(λx -> x) t");
      expect(reduce(t)).toEqual([parse("t"), true]);
    });

    test("reduce((λf x -> f x) x) = λx' -> x x'", async () => {
      const t = parse("(λf x -> f x) x");
      expect(reduce(t)).toEqual([parse("λx' -> x x'"), true]);
    });
  });

  describe("normal order strategy", async () => {
    test("reduce(((λx -> x) a) ((λx -> x) b)) = a ((λx -> x) b)", async () => {
      const t = parse("((λx -> x) a) ((λx -> x) b)");
      expect(reduce(t)).toEqual([parse("a ((λx -> x) b)"), true]);
    });

    test("reduce(((λx -> x) a) ((λx -> x) b) ((λx -> x) c)) = a ((λx -> x) b) ((λx -> x) c)", async () => {
      const t = parse("((λx -> x) a) ((λx -> x) b) ((λx -> x) c)");
      expect(reduce(t)).toEqual([parse("a ((λx -> x) b) ((λx -> x) c)"), true]);
    });

    test("reduce((λx -> x) ((λx -> x a) t)) = (λx -> x a) t", async () => {
      const t = parse("(λx -> x) ((λx -> x a) t)");
      expect(reduce(t)).toEqual([parse("(λx -> x a) t"), true]);
    });

    test("reduce((λx -> x) ((λx -> a x) ((λx -> b x) t))) = (λx -> a x) ((λx -> b x) t)", async () => {
      const t = parse("(λx -> x) ((λx -> a x) ((λx -> b x) t))");
      expect(reduce(t)).toEqual([parse("(λx -> a x) ((λx -> b x) t)"), true]);
    });

    test("reduce((λx -> x x) (λx -> x x)) = (λx -> x x)", async () => {
      const t = parse("(λx -> x x) (λx -> x x)");
      expect(reduce(t)).toEqual([t, true]);
    });
  });
});
