/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { lex, type Token, TokenKind } from "$lib/lambda/lexer";
import {
  mkAbs,
  mkApp,
  mkVar,
  SyntaxError,
  toChurch,
  type Abs,
  type Term,
  type Var,
} from "$lib/lambda/syntax";
import { assert } from "$lib/util";

// In EBNF notation, we implement the following grammar for λ-terms:
// <term> ::= <abstraction> | <let> | <application>
// <let> ::= "let" <identifier> ":=" <term> "in" <term>
// <abstraction> ::= "\\" <identifier>+ "->" <term>
// <application> ::= <application> <atom> | <atom>
// <atom> ::= <variable> | <natural> | "(" <term> ")"
// <variable> ::= <identifier>

/** Parse a λ-calculus term. */
export function parse(input: string): Term {
  return new Parser(input).parse();
}

/** A parser for λ-calculus programs. */
class Parser {
  /** The input string to parse. */
  #tokens: Token[];
  /** The current position of this parser within the token stream. */
  #position = 0;

  /**
   * Construct a new λ-calculus parser.
   * @param input The input string to parse as a λ-calculus program.
   */
  constructor(input: string) {
    this.#tokens = lex(input);
  }

  /** Parse the input into a λ-calculus term. */
  parse(): Term {
    if (this.#tokens[0].kind === TokenKind.EOF) {
      throw new SyntaxError(0, "unexpected EOF");
    }
    assert(this.#position !== this.#tokens.length, "parser exhausted");

    const t = this.#term();
    this.#consume(TokenKind.EOF);

    return t;
  }

  /** Parse the term nonterminal. */
  #term(): Term {
    switch (this.#peek().kind) {
      case TokenKind.Lambda:
        return this.#abs();
      case TokenKind.Let:
        return this.#let();
      default:
        return this.#app();
    }
  }

  /** Parse the abstraction nonterminal. */
  #abs(): Abs {
    this.#consume(TokenKind.Lambda);
    const head = [this.#ident()];
    while (this.#peek().kind === TokenKind.Ident) {
      head.push(this.#ident());
    }
    this.#consume(TokenKind.RArrow);
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

  /** Parse the let nonterminal. */
  #let(): Term {
    this.#consume(TokenKind.Let);
    const x = this.#ident();
    this.#consume(TokenKind.ColonEq);
    const s = this.#term();
    this.#consume(TokenKind.In);
    const t = this.#term();

    return mkApp(mkAbs(x, t), s);
  }

  /** Parse the application nonterminal. */
  #app(): Term {
    const isAtomPrefix = (token: Token): boolean =>
      token.kind === TokenKind.LParen ||
      token.kind === TokenKind.Ident ||
      token.kind === TokenKind.Natural;

    let lhs = this.#atom();
    while (isAtomPrefix(this.#peek())) {
      const rhs = this.#atom();
      lhs = mkApp(lhs, rhs);
    }

    return lhs;
  }

  /** Parse the atom nonterminal. */
  #atom(): Term {
    if (this.#peek().kind !== TokenKind.LParen) {
      return this.#peek().kind === TokenKind.Ident ? this.#var() : this.#natural();
    }

    this.#consume(TokenKind.LParen);
    const t = this.#term();
    this.#consume(TokenKind.RParen);

    return t;
  }

  /** Parse the variable nonterminal. */
  #var(): Var {
    return mkVar(this.#ident());
  }

  /** Parse an identifier. */
  #ident(): string {
    if (this.#peek().kind !== TokenKind.Ident) {
      throw new SyntaxError(this.#position, "an identifier was expected");
    }

    const ident = this.#peek().lexeme;
    this.#position += 1;
    return ident;
  }

  /** Parse a natural number. */
  #natural(): Term {
    const token = this.#peek();
    this.#consume(TokenKind.Natural);
    return toChurch(parseInt(token.lexeme));
  }

  /** Get the token at the current position of the parser. */
  #peek(): Token {
    return this.#tokens[this.#position];
  }

  /** Assert the presence of a token and advance the parser. */
  #consume(kind: TokenKind) {
    const token = this.#peek();
    if (token.kind === kind) {
      this.#position += 1;
    } else {
      let wanted;
      switch (kind) {
        case TokenKind.Lambda:
          wanted = "a λ or \\";
          break;
        case TokenKind.RArrow:
          wanted = "a ->";
          break;
        case TokenKind.LParen:
          wanted = "a (";
          break;
        case TokenKind.RParen:
          wanted = " a )";
          break;
        case TokenKind.Ident:
          wanted = "an identifier";
          break;
        case TokenKind.Natural:
          wanted = "a natural number";
          break;
        case TokenKind.EOF:
          wanted = "end of file";
          break;
      }
      throw new SyntaxError(token.position, `${wanted} was expected`);
    }
  }
}
