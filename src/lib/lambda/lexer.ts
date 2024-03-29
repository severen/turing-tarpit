/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { SyntaxError } from "$lib/lambda/syntax";

/** A lexical token. */
export type Token = {
  kind: TokenKind;
  lexeme: string;
  position: number;
};

/** The kind of a Token. */
export enum TokenKind {
  /** A `λ` character, or its ASCII stand-in, `\`. */
  Lambda,
  /** A `let` keyword. */
  Let,
  /** A colon equals symbol, `:=`. */
  ColonEq,
  /** An `in` keyword. */
  In,
  /** A right arrow symbol, `->`. */
  RArrow,
  /** A right bracket character, `(`. */
  LParen,
  /** A right bracket character, `)`. */
  RParen,
  /** An identifier. */
  Ident,
  /** A natural number literal. */
  Natural,
  /** A marker for the end of a file. */
  EOF,
}

/** Syntactically analyse, or lex, a potential λ-calculus term. */
export function lex(input: string): Token[] {
  return new Lexer(input).lex();
}

/** A lexer for λ-calculus programs. */
class Lexer {
  /** The input string to parse. */
  #input: string;
  /** The current character position of this lexer within the input string. */
  #position = 0;
  /** The character position of the start of the current token. */
  #start = 0;

  /** The lexically analysed tokens. */
  #tokens: Token[] = [];

  readonly #reIdent = /^\p{ID_Start}\p{ID_Continue}*'*/u;
  readonly #reNatural = /^[0-9]+/u;
  readonly #reWhitespace = /^\p{Pattern_White_Space}+/u;

  readonly #keywords: Map<string, TokenKind> = new Map([
    ["let", TokenKind.Let],
    ["in", TokenKind.In],
  ]);

  constructor(input: string) {
    this.#input = input;
  }

  /** Lex the input string to produce a stream of tokens. */
  lex(): Token[] {
    while (!this.#isAtEnd()) {
      this.#start = this.#position;
      this.#lexToken();
    }

    this.#tokens.push({ kind: TokenKind.EOF, lexeme: "", position: this.#position });
    return this.#tokens;
  }

  /** Lex a single token. */
  #lexToken(): void {
    const char = this.#advance();
    switch (char) {
      case "λ":
      case "\\":
        this.#pushToken(TokenKind.Lambda);
        break;
      case "-": {
        if (this.#match(">")) {
          this.#pushToken(TokenKind.RArrow);
        } else if (this.#match("-")) {
          while (!this.#match("\n") && !this.#isAtEnd()) {
            this.#advance();
          }
        } else {
          throw new SyntaxError(this.#start, "got invalid token -, expected -> or --");
        }
        break;
      }
      case ":":
        if (this.#match("=")) {
          this.#pushToken(TokenKind.ColonEq);
        } else {
          throw new SyntaxError(this.#start, "got invalid token :, expected :=");
        }
        break;
      case "(":
        this.#pushToken(TokenKind.LParen);
        break;
      case ")":
        this.#pushToken(TokenKind.RParen);
        break;
      default: {
        const tail = this.#input.slice(this.#start);
        if (this.#reIdent.test(char)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const ident = tail.match(this.#reIdent)![0];
          this.#position += ident.length - 1;
          this.#pushToken(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            !this.#keywords.has(ident) ? TokenKind.Ident : this.#keywords.get(ident)!,
          );
        } else if (this.#reWhitespace.test(char)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const whitespace = tail.match(this.#reWhitespace)![0];
          this.#position += whitespace.length - 1;
        } else if (this.#reNatural.test(char)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const natural = tail.match(this.#reNatural)![0];
          this.#position += natural.length - 1;
          this.#pushToken(TokenKind.Natural);
        } else {
          throw new SyntaxError(this.#start, `got invalid token ${char}`);
        }
        break;
      }
    }
  }

  #pushToken(kind: TokenKind): void {
    this.#tokens.push({
      kind,
      lexeme: this.#input.slice(this.#start, this.#position),
      position: this.#start,
    });
  }

  /** Get the current character and advance the lexer. */
  #advance(): string {
    return this.#input[this.#position++];
  }

  /** Get the current character without advancing the lexer. */
  #peek(): string {
    return this.#input[this.#position];
  }

  /** Advance the lexer if the current character equals the given character. */
  #match(char: string): boolean {
    if (this.#peek() === char) {
      this.#position += 1;
      return true;
    }

    return false;
  }

  /** Check if the lexer is at the end of the input. */
  #isAtEnd(): boolean {
    return this.#position === this.#input.length;
  }
}
