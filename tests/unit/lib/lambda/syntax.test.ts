/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { freeVars, mkAbs, mkApp, mkVar } from "$lib/lambda/syntax";

describe("function freeVars", () => {
  it("works for a single variable", async () => {
    const t = mkVar("x");
    expect(freeVars(t)).toEqual(new Set(["x"]));
  });

  it("works for an abstraction", async () => {
    const t = mkAbs("f", mkVar("x"));
    expect(freeVars(t)).toEqual(new Set(["x"]));
  });

  it("works for an application", async () => {
    const t = mkApp(mkVar("f"), mkVar("x"));
    expect(freeVars(t)).toEqual(new Set(["f", "x"]));
  });

  it("ignores bound variables", async () => {
    const t = mkAbs("x", mkVar("x"));
    expect(freeVars(t)).toEqual(new Set([]));
  });

  it("does not duplicate variables", async () => {
    const t = mkApp(mkVar("x"), mkVar("x"));
    expect(freeVars(t)).toEqual(new Set(["x"]));
  });
});
