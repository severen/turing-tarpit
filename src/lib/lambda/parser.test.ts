/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect, describe, it } from "vitest";

import { mkVar } from "$lib/lambda/syntax";
import { parseVar } from "$lib/lambda/parser";

describe("parseVar", () => {
  it("parses a single character identifier", async () => {
    const t = parseVar("x");
    expect(t).toEqual(mkVar("x"));
  });

  it("parses a multicharacter identifier", async () => {
    const t = parseVar("foobar");
    expect(t).toEqual(mkVar("foobar"));
  });

  it("ignores trailing input", async () => {
    const t1 = parseVar("x  ");
    expect(t1).toEqual(mkVar("x"));

    const t2 = parseVar("x\t");
    expect(t2).toEqual(mkVar("x"));

    const t3 = parseVar("x y z");
    expect(t3).toEqual(mkVar("x"));
  });

  it("does not parse the empty string", async () => {
    const t = parseVar("");
    expect(t).toBeUndefined();
  });

  it("does not parse whitespace", async () => {
    const s = parseVar(" ");
    expect(s).toBeUndefined();

    const t = parseVar("\t");
    expect(t).toBeUndefined();
  });
});
