/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { lex, TokenKind } from "$lib/lambda/lexer";

describe("λ-calculus Lexer", async () => {
  it("lexes identifiers", async () => {
    expect(lex("x")).toEqual([
      { kind: TokenKind.Ident, lexeme: "x", position: 0 },
      { kind: TokenKind.EOF, lexeme: "", position: 1 },
    ]);
    expect(lex("foo")).toEqual([
      { kind: TokenKind.Ident, lexeme: "foo", position: 0 },
      { kind: TokenKind.EOF, lexeme: "", position: 3 },
    ]);
    expect(lex("α")).toEqual([
      { kind: TokenKind.Ident, lexeme: "α", position: 0 },
      { kind: TokenKind.EOF, lexeme: "", position: 1 },
    ]);
  });

  it("lexes an application", async () => {
    expect(lex("f x")).toEqual([
      { kind: TokenKind.Ident, lexeme: "f", position: 0 },
      { kind: TokenKind.Ident, lexeme: "x", position: 2 },
      { kind: TokenKind.EOF, lexeme: "", position: 3 },
    ]);
  });

  it("lexes an abstraction", async () => {
    expect(lex("\\x -> x")).toEqual([
      { kind: TokenKind.Lambda, lexeme: "\\", position: 0 },
      { kind: TokenKind.Ident, lexeme: "x", position: 1 },
      { kind: TokenKind.RArrow, lexeme: "->", position: 3 },
      { kind: TokenKind.Ident, lexeme: "x", position: 6 },
      { kind: TokenKind.EOF, lexeme: "", position: 7 },
    ]);
  });

  it("lexes a bracketed application", async () => {
    expect(lex("(\\x -> x) t")).toEqual([
      { kind: TokenKind.LParen, lexeme: "(", position: 0 },
      { kind: TokenKind.Lambda, lexeme: "\\", position: 1 },
      { kind: TokenKind.Ident, lexeme: "x", position: 2 },
      { kind: TokenKind.RArrow, lexeme: "->", position: 4 },
      { kind: TokenKind.Ident, lexeme: "x", position: 7 },
      { kind: TokenKind.RParen, lexeme: ")", position: 8 },
      { kind: TokenKind.Ident, lexeme: "t", position: 10 },
      { kind: TokenKind.EOF, lexeme: "", position: 11 },
    ]);
  });

  it("ignores whitespace", async () => {
    expect(lex(" ")).toEqual([{ kind: TokenKind.EOF, lexeme: "", position: 1 }]);
    expect(lex("\t")).toEqual([{ kind: TokenKind.EOF, lexeme: "", position: 1 }]);
    expect(lex("\n")).toEqual([{ kind: TokenKind.EOF, lexeme: "", position: 1 }]);
    expect(lex("\r\n")).toEqual([{ kind: TokenKind.EOF, lexeme: "", position: 2 }]);
  });
});
