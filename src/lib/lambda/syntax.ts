/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert } from "$lib/assert";

// The abstract syntax for λ-terms defined here is a _locally nameless_ representation
// similar to that defined by McBride and McKinna in 'I am not a number - I am a free
// variable' (https://doi.org/10.1145/1017472.1017477).
//
// In short, the idea is to represent free variables by names, as usual, but to represent
// _bound_ variables with _de Bruijn indices_. In order to preserve the original variable
// names from the concrete syntax, each binder continues to carry a name (taken from the
// concrete syntax) for use as a hint for the pretty printer.

/** A λ-term. */
export type Term = FVar | BVar | Abs | App;

/** The kind of a Term. */
export enum TermKind {
  /** A free variable. */
  FVar,
  /** A bound variable. */
  BVar,
  /** A λ-abstraction. */
  Abs,
  /** An application. */
  App,
}

/** A free variable term. */
export type FVar = {
  readonly kind: TermKind.FVar;
  /** The name of this variable. */
  readonly name: string;
};

/** A bound variable term. */
export type BVar = {
  readonly kind: TermKind.BVar;
  /**
   * The de Bruijn index which represents this variable.
   *
   * By _de Bruijn index_, it is meant the number of binders between this bound variable
   * and its corresponding binder. For example, `\x -> \y -> x` corresponds to `\ -> \ ->
   * 1`, in which we see that x corresponds to 1 (and not, for example, 2) due to the \y
   * binder in between \x and x.
   */
  readonly index: number;
};

/** A λ-abstraction term. */
export type Abs = {
  readonly kind: TermKind.Abs;
  /**
   * The name of the variable bound in the head of this abstraction.
   *
   * As substitution is performed with de Bruijn indices, this field is _only_ present as
   * a 'hint' for the pretty printer so that it may present symbolic names corresponding
   * to the user's original input.
   */
  readonly head: string;
  /** The body (or scope) of this abstraction. */
  readonly body: Term;
};

/** An application term. */
export type App = {
  readonly kind: TermKind.App;
  /** The left applicand. */
  readonly left: Term;
  /** The right applicand. */
  readonly right: Term;
};

/**
 * Construct a new variable term.
 * @param name The name of this variable.
 */
export const mkFVar = (name: string): FVar => ({ kind: TermKind.FVar, name });

/**
 * Construct a new variable term.
 * @param index The de Bruijn index which represents the variable.
 */
export const mkBVar = (index: number): BVar => {
  // Paranoid assertion to ensure the provided index is actually a natural
  // number.
  assert(Number.isSafeInteger(index) && index >= 0, "expected natural number");

  return { kind: TermKind.BVar, index };
};

/**
 * Construct a new λ-abstraction term.
 * @param head The name of the variable bound by the abstraction.
 * @param body The body of the abstraction.
 */
export const mkAbs = (head: string, body: Term): Abs => ({
  kind: TermKind.Abs,
  head,
  body,
});

/**
 * Construct a new application term.
 * @param left The applicand.
 * @param right The argument.
 */
export const mkApp = (left: Term, right: Term): App => ({
  kind: TermKind.App,
  left,
  right,
});

/**
 * Apply a function to each term encountered while traversing a syntax tree of
 * terms.
 * @param f The function to apply to each term in the syntax tree.
 * @param root The root term of the syntax tree.
 */
export function apply(f: (t: Term) => void, root: Term): void {
  const todo = [root];
  while (todo.length > 0) {
    // By the loop condition above, t will never be undefined/null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const t = todo.pop()!;
    f(t);

    if (t.kind === TermKind.App) {
      todo.push(t.right);
      todo.push(t.left);
    } else if (t.kind === TermKind.Abs) {
      todo.push(t.body);
    }
  }
}
