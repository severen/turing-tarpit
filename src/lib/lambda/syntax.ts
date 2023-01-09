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
