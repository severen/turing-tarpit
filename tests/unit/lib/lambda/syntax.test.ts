/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, test } from "vitest";

import { freeVars, mkAbs, mkApp, mkVar, prettyPrint } from "$lib/lambda/syntax";

describe("function freeVars(t: Term): Set<Name>", async () => {
  test("freeVars(x) = {x}", async () => {
    const t = mkVar("x");
    expect(freeVars(t)).toEqual(new Set(["x"]));
  });

  test("freeVars(λf -> f) = ∅", async () => {
    const t = mkAbs("f", mkVar("f"));
    expect(freeVars(t)).toEqual(new Set());
  });

  test("freeVars(λf -> x) = {x}", async () => {
    const t = mkAbs("f", mkVar("x"));
    expect(freeVars(t)).toEqual(new Set(["x"]));
  });

  test("freeVars(f x) = {f, x}", async () => {
    const t = mkApp(mkVar("f"), mkVar("x"));
    expect(freeVars(t)).toEqual(new Set(["f", "x"]));
  });

  test("freeVars((λx -> x) x) = {x}", async () => {
    const t = mkApp(mkAbs("x", mkVar("x")), mkVar("x"));
    expect(freeVars(t)).toEqual(new Set(["x"]));
  });
});

describe("function prettyPrint(t: Term): string", async () => {
  test("prettyPrint(x) = x", async () => {
    const t = mkVar("x");
    expect(prettyPrint(t)).toEqual(t.name);
  });

  test("prettyPrint(λx -> x) = λx -> x", async () => {
    const t = mkAbs("x", mkVar("x"));
    expect(prettyPrint(t)).toEqual("λx -> x");
  });

  test("prettyPrint(f x) = f x", async () => {
    const t = mkApp(mkVar("f"), mkVar("x"));
    expect(prettyPrint(t)).toEqual("f x");
  });

  test("prettyPrint(λx -> (f x)) = λx -> f x", async () => {
    const t = mkAbs("x", mkApp(mkVar("f"), mkVar("x")));
    expect(prettyPrint(t)).toEqual("λx -> f x");
  });

  test("prettyPrint(((f x) y) z) = f x y z", async () => {
    const t = mkApp(mkApp(mkApp(mkVar("f"), mkVar("x")), mkVar("y")), mkVar("z"));
    expect(prettyPrint(t)).toEqual("f x y z");
  });

  test("prettyPrint(f (id x)) = f (id x)", async () => {
    const t = mkApp(mkVar("f"), mkApp(mkVar("id"), mkVar("x")));
    expect(prettyPrint(t)).toEqual("f (id x)");
  });

  test("prettyPrint(λf -> λx -> f (f x)) = λf x -> f (f x)", async () => {
    const t = mkAbs("f", mkAbs("x", mkApp(mkVar("f"), mkApp(mkVar("f"), mkVar("x")))));
    expect(prettyPrint(t)).toEqual("λf x -> f (f x)");
  });
});
