/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** A name in a λ-term. */
export type Name = string;

/** A λ-term. */
export type Term = Var | Abs | App;

/** A variable term. */
export type Var = { readonly kind: TermKind.Var; readonly name: Name };
/** An abstraction term. */
export type Abs = {
  readonly kind: TermKind.Abs;
  readonly head: Name;
  readonly body: Term;
};
/** An application term. */
export type App = {
  readonly kind: TermKind.App;
  readonly left: Term;
  readonly right: Term;
};

/** The kind of a Term. */
export enum TermKind {
  Var,
  Abs,
  App,
}

/**
 * Construct a new variable term.
 * @param name The name of this variable.
 */
export const mkVar = (name: Name): Var => ({ kind: TermKind.Var, name });
/**
 * Construct a new abstraction term.
 * @param head The bound variable.
 * @param body The body term.
 */
export const mkAbs = (head: Name, body: Term): Abs => ({
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

/** A syntax error in a λ-calculus program. */
export class SyntaxError extends Error {
  /** The start location of this syntax error within the input. */
  position: number;

  constructor(position: number, message: string) {
    super(`${message} (at position ${position})`);
    this.name = "SyntaxError";
    this.position = position;
  }
}

/** Get the free variables contained in a term. */
export function freeVars(t: Term): Set<Name> {
  switch (t.kind) {
    case TermKind.Var:
      return new Set([t.name]);
    case TermKind.Abs:
      return new Set([...freeVars(t.body)].filter((x) => x !== t.head));
    case TermKind.App:
      return new Set([...freeVars(t.left), ...freeVars(t.right)]);
  }
}

/**
 * Convert a term to its _pretty_ string representation.
 *
 * Each term is formatted in such a way that:
 * 1. Consecutive single variable abstractions are combined into one multivariate
 *    abstraction.
 * 2. As many superfluous brackets as possible are removed.
 *
 * @param t The term to convert to a string.
 */
export function prettyPrint(t: Term): Name {
  switch (t.kind) {
    case TermKind.Var:
      return t.name.toString();
    case TermKind.Abs: {
      let f = t;
      let xs = [f.head];
      while (f.body.kind === TermKind.Abs) {
        f = f.body;
        xs = [...xs, f.head];
      }
      return `λ${xs.join(" ")} -> ${prettyPrint(f.body)}`;
    }
    case TermKind.App: {
      const left = prettyPrint(t.left);
      const right = prettyPrint(t.right);
      if (
        t.left.kind === TermKind.Abs &&
        (t.right.kind === TermKind.Abs || t.right.kind === TermKind.App)
      ) {
        return `(${left}) (${right})`;
      } else if (t.left.kind === TermKind.Abs) {
        return `(${left}) ${right}`;
      } else if (t.right.kind === TermKind.App) {
        return `${left} (${right})`;
      }

      return `${left} ${right}`;
    }
  }
}

/** Convert a natural number to its corresponding Church numeral. */
export function toChurch(n: number): Abs {
  let t: Term = mkVar("x");
  for (let i = 0; i < n; ++i) {
    t = mkApp(mkVar("f"), t);
  }

  return mkAbs("f", mkAbs("x", t));
}
