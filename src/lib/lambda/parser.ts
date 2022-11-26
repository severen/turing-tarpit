/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mkAbs, mkVar, type Abs, type Term, type Var } from "$lib/lambda/syntax";

/** A syntax error encountered while parsing a λ-calculus program. */
export class SyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyntaxError";
  }
}

/** A parser for λ-calculus programs. */
export class Parser {
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

  /** Parse the input into a tree of terms. */
  parse(): Term {
    if (this.#input.length === 0) {
      throw new SyntaxError("unexpected EOF");
    } else if (this.#position >= this.#input.length) {
      // TODO: Do something more sensible here.
      throw new Error();
    }

    return this.#term();
  }

  /** Parse a term. */
  #term(): Term {
    const c = this.#peek();
    switch (c) {
      case "λ":
      case "\\":
        return this.#abs();
      default:
        // Otherwise, _attempt_ to parse a variable.
        return this.#var();
    }
  }

  /** Parse a variable term. */
  #var(): Var {
    const reVar = /^\p{XID_Start}\p{XID_Continue}*/u;
    const matches = this.#input.substring(this.#position).match(reVar);
    if (!matches) {
      // If we find ourselves here, then we must have encountered an
      // unrecognised token since we would have otherwise already tried to
      // parse an abstraction or application (see this.#term).
      throw new SyntaxError(`unexpected token ${this.#peek()}`);
    }

    const ident = matches[0];
    this.#consume(ident);
    return mkVar(ident);
  }

  /** Parse an abstraction term. */
  #abs(): Abs {
    if (this.#peek() === "λ") {
      this.#consume("λ");
    } else {
      this.#consume("\\");
    }
    const head = this.#var();
    this.#consume("->");
    const body = this.#term();

    return mkAbs(head.name, body);
  }

  /** Get the character at the current position of the parser. */
  #peek(): string {
    return this.#input[this.#position];
  }

  /** Consume a token from the input. */
  #consume(token: string): void {
    const start = this.#position;
    const end = start + token.length;
    const substring = this.#input.substring(start, end);
    if (substring !== token) {
      throw new SyntaxError(`expected ${token}, got ${substring}`);
    }

    this.#position += token.length;
    this.#consumeSpace();
  }

  /** Consume and discard whitespace in the input. */
  #consumeSpace(): void {
    const reWhitespace = /^\p{Pattern_White_Space}*/u;
    const matches = this.#input.substring(this.#position).match(reWhitespace);
    if (matches) {
      this.#position += matches[0].length;
    }
  }
}
