/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mkAbs, mkApp, mkVar, type Abs, type Term, type Var } from "$lib/lambda/syntax";
import { isAlpha } from "$lib/util";

// In EBNF notation, we implement the following grammar for λ-terms:
// <term> ::= <abstraction> | <application>
// <abstraction> ::= "\\" <identifier> "->" <term>
// <application> ::= <application> <atom> | <atom>
// <atom> ::= <variable> | "(" <term> ")"
// <variable> ::= <identifier>

/** A syntax error encountered while parsing a λ-calculus program. */
export class SyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyntaxError";
  }
}

/** Parse a λ-calculus term. */
export function parse(input: string): Term {
  return new Parser(input).parse();
}

/** A parser for λ-calculus programs. */
class Parser {
  /** The input string to parse. */
  #input: string;
  /** The current character position of this parser within the input string. */
  #position = 0;

  /**
   * Construct a new λ-calculus parser.
   * @param input The input string to parse as a λ-calculus program.
   */
  constructor(input: string) {
    this.#input = input.trim();
  }

  /** Parse the input into a λ-calculus term. */
  parse(): Term {
    if (this.#input.length === 0) {
      throw new SyntaxError("unexpected EOF");
    } else if (this.#position >= this.#input.length) {
      // TODO: Do something more sensible here.
      throw new Error();
    }

    const t = this.#term();
    if (!this.#isAtEnd()) {
      throw new SyntaxError(`expected EOF, got ${this.#peek()}`);
    }
    return t;
  }

  /** Parse a term. */
  #term(): Term {
    if (this.#peek() === "\\") {
      return this.#abs();
    }

    return this.#app();
  }

  /** Parse an abstraction term. */
  #abs(): Abs {
    this.#consume("\\");
    const head = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    while (!this.#isAtEnd() && isAlpha(this.#peek()!)) {
      head.push(this.#var().name);
    }
    this.#consume("->");
    const body = this.#term();

    // Here we desugar the multivariate abstraction into a series of nested
    // single-variable abstractions.
    return head
      .slice(0, head.length - 1)
      .reduceRight(
        (body, head) => mkAbs(head, body),
        mkAbs(head[head.length - 1], body),
      );
  }

  /** Parse an application term. */
  #app(): Term {
    const isAtomPrefix = (char: string): boolean => char === "(" || isAlpha(char);

    let lhs = this.#atom();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    while (!this.#isAtEnd() && isAtomPrefix(this.#peek()!)) {
      const rhs = this.#atom();
      lhs = mkApp(lhs, rhs);
    }

    return lhs;
  }

  #atom(): Term {
    if (this.#peek() !== "(") {
      return this.#var();
    }

    this.#consume("(");
    const t = this.#term();
    this.#consume(")");

    return t;
  }

  #var(): Var {
    return mkVar(this.#ident());
  }

  /** Parse an identifier. */
  #ident(): string {
    // TODO: Allow Unicode identifiers again.
    // const reVar = /^\p{XID_Start}\p{XID_Continue}*/u;
    const reIdent = /^[a-zA-Z]+'?/u;
    const matches = this.#input.substring(this.#position).match(reIdent);
    if (!matches) {
      // TODO: I think this actually might be unreachable in light of how #app
      // works.
      // If we find ourselves here, then we must have encountered an
      // unrecognised token since we would have otherwise already tried to
      // parse an abstraction or application (see this.#term).
      throw new SyntaxError(`unexpected token ${this.#peek()}`);
    }

    const ident = matches[0];
    this.#consume(ident);
    return ident;
  }

  /** Check if the parser has consumed the entire input. */
  #isAtEnd(): boolean {
    return this.#position === this.#input.length;
  }

  /**
   * Get the character at the current position of the parser, or undefined if
   * the entire input has been consumed.
   */
  #peek(): string | undefined {
    return this.#input[this.#position];
  }

  /** Assert the presence of a lexeme in the input and advance the parser. */
  #consume(token: string): void {
    const start = this.#position;
    const end = start + token.length;
    const substring = this.#input.substring(start, end);
    if (substring !== token) {
      throw new SyntaxError(`expected ${token}, got ${substring}`);
    }

    this.#position += token.length;
    this.#discardWhitespace();
  }

  /** Advance the parser over whitespace in the input. */
  #discardWhitespace(): void {
    const reWhitespace = /^\p{Pattern_White_Space}+/u;
    const matches = this.#input.substring(this.#position).match(reWhitespace);
    if (matches) {
      this.#position += matches[0].length;
    }
  }
}
