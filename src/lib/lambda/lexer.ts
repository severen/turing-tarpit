/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { SyntaxError } from "$lib/lambda/syntax";

export enum TokenKind {
  /** A `λ` character, or its ASCII stand-in, `\`. */
  Lambda,
  /** A right arrow symbol, `->`. */
  RArrow,
  /** A right bracket character, `(`. */
  LParen,
  /** A right bracket character, `)`. */
  RParen,
  /** An identifier. */
  Ident,
  /** A marker for the end of a file. */
  EOF,
}

export type Token = {
  kind: TokenKind;
  lexeme: string;
  position: number;
};

/** Syntactically analyse, i.e. lex, a potential λ-calculus term. */
export function lex(input: string): Token[] {
  return new Lexer(input).lex();
}

/** A lexer for λ-calculus programs. */
class Lexer {
  /** The input string to parse. */
  #input: string;
  /** The current character position of this lexer within the input string. */
  #position = 0;

  readonly #reIdent = /^\p{ID_Start}\p{ID_Continue}*'*/u;
  readonly #reWhitespace = /^\p{Pattern_White_Space}+/u;

  constructor(input: string) {
    this.#input = input.trim();
  }

  lex(): Token[] {
    const tokens: Token[] = [];
    const pushToken = (kind: TokenKind, lexeme: string) => {
      tokens.push({ kind, lexeme, position: this.#position });
      this.#position += lexeme.length;
    };

    while (this.#position < this.#input.length) {
      const head = this.#peek();
      switch (head) {
        case "λ":
        case "\\":
          pushToken(TokenKind.Lambda, head);
          break;
        case "-":
          if (this.#peekNext() === ">") {
            pushToken(
              TokenKind.RArrow,
              this.#input.slice(this.#position, this.#position + 2),
            );
          } else {
            throw new SyntaxError(this.#position, "got invalid token -");
          }
          break;
        case "(":
          pushToken(TokenKind.LParen, head);
          break;
        case ")":
          pushToken(TokenKind.RParen, head);
          break;
        default: {
          const tail = this.#input.slice(this.#position);
          if (this.#reIdent.test(tail)) {
            // Impossible by branch condition.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const ident = tail.match(this.#reIdent)![0];
            pushToken(TokenKind.Ident, ident);
          } else if (this.#reWhitespace.test(tail)) {
            // Impossible by branch condition.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.#position += this.#input
              .substring(this.#position)
              .match(this.#reWhitespace)![0].length;
          } else {
            throw new SyntaxError(this.#position, `got invalid token ${head}`);
          }
          break;
        }
      }
    }

    pushToken(TokenKind.EOF, "");
    return tokens;
  }

  #peek(): string {
    return this.#input[this.#position];
  }

  #peekNext(): string | undefined {
    const i = this.#position + 1;
    return i < this.#input.length ? this.#input[i] : undefined;
  }
}
