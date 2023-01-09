/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert } from "$lib/util";
import { mkAbs, mkApp, mkVar, type Abs, type Term, type Var } from "$lib/lambda/syntax";

// In EBNF notation, we implement the following grammar for λ-terms:
// <term> ::= <abstraction> | <application>
// <abstraction> ::= "\\" <identifier>+ "->" <term>
// <application> ::= <application> <atom> | <atom>
// <atom> ::= <variable> | "(" <term> ")"
// <variable> ::= <identifier>

/** A syntax error encountered while parsing a λ-calculus program. */
export class SyntaxError extends Error {
  /** The start location of this syntax error within the input. */
  position: number;

  constructor(position: number, message: string) {
    super(message);
    this.name = "SyntaxError";
    this.position = position;
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

  // TODO: Disallow λ in identifiers.
  readonly #reIdent = /^\p{ID_Start}\p{ID_Continue}*'*/u;
  readonly #reWhitespace = /^\p{Pattern_White_Space}+/u;

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
      throw new SyntaxError(this.#position, "unexpected EOF");
    }

    assert(!this.#isAtEnd(), "parser exhausted");

    const t = this.#term();
    if (!this.#isAtEnd()) {
      throw new SyntaxError(this.#position, `expected EOF, got ${this.#peek()}`);
    }
    return t;
  }

  /** Parse the term nonterminal. */
  #term(): Term {
    const token = this.#peek();
    return token === "\\" || token === "λ" ? this.#abs() : this.#app();
  }

  /** Parse the abstraction nonterminal. */
  #abs(): Abs {
    const isIdentPrefix = (char: string): boolean => this.#reIdent.test(char);

    if (this.#peek() === "\\") {
      this.#consume("\\");
    } else {
      this.#consume("λ");
    }
    const head = [];
    while (isIdentPrefix(this.#peek())) {
      head.push(this.#ident());
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

  /** Parse the application nonterminal. */
  #app(): Term {
    const isAtomPrefix = (char: string): boolean =>
      char === "(" || this.#reIdent.test(char);

    let lhs = this.#atom();
    while (isAtomPrefix(this.#peek())) {
      const rhs = this.#atom();
      lhs = mkApp(lhs, rhs);
    }

    return lhs;
  }

  /** Parse the atom nonterminal. */
  #atom(): Term {
    if (this.#peek() !== "(") {
      return this.#var();
    }

    this.#consume("(");
    const t = this.#term();
    this.#consume(")");

    return t;
  }

  /** Parse the variable nonterminal. */
  #var(): Var {
    return mkVar(this.#ident());
  }

  /** Parse an identifier. */
  #ident(): string {
    const matches = this.#input.substring(this.#position).match(this.#reIdent);
    if (!matches) {
      throw new SyntaxError(this.#position, `expected identifier, got ${this.#peek()}`);
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
   * Get the character at the current position of the parser, or the null
   * character if the entire input has been consumed.
   */
  #peek(): string {
    return !this.#isAtEnd() ? this.#input[this.#position] : "\0";
  }

  /** Assert the presence of a lexeme in the input and advance the parser. */
  #consume(lexeme: string): void {
    const start = this.#position;
    const end = start + lexeme.length;
    const substring = this.#input.substring(start, end);
    if (substring !== lexeme) {
      throw new SyntaxError(this.#position, `expected ${lexeme}, got ${substring}`);
    }

    this.#position += lexeme.length;
    this.#discardWhitespace();
  }

  /** Advance the parser over whitespace in the input. */
  #discardWhitespace(): void {
    const matches = this.#input.substring(this.#position).match(this.#reWhitespace);
    if (matches) {
      this.#position += matches[0].length;
    }
  }
}
