/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, test } from "vitest";

import { freeVars, mkAbs, mkApp, mkVar } from "$lib/lambda/syntax";

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
