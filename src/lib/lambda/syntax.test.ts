/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect, describe, it } from "vitest";

import { mkVar, mkAbs, mkApp, freeVars } from "$lib/lambda/syntax";

describe("freeVariables", () => {
  it("works for a single variable", async () => {
    const t = mkVar("x");
    expect(freeVars(t)).toEqual(["x"]);
  });

  it("works for an abstraction", async () => {
    const t = mkAbs("f", mkVar("x"));
    expect(freeVars(t)).toEqual(["x"]);
  });

  it("works for an application", async () => {
    const t = mkApp(mkVar("f"), mkVar("x"));
    expect(freeVars(t)).toEqual(["f", "x"]);
  });

  it("ignores bound variables", async () => {
    const t = mkAbs("x", mkVar("x"));
    expect(freeVars(t)).toEqual([]);
  });

  it("does not duplicate variables", async () => {
    const t = mkApp(mkVar("x"), mkVar("x"));
    expect(freeVars(t)).toEqual(["x"]);
  });
});
