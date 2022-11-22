/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** A λ-term. */
export type Term<T = string> = Var<T> | Abs<T> | App<T>;

/** A variable term. */
export type Var<T = string> = { readonly kind: TermKind.Var; readonly name: T };
/** An abstraction term. */
export type Abs<T = string> = {
  readonly kind: TermKind.Abs;
  readonly head: T;
  readonly body: Term<T>;
};
/** An application term. */
export type App<T = string> = {
  readonly kind: TermKind.App;
  readonly left: Term;
  readonly right: Term<T>;
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
export const mkVar = (name: string): Var => ({ kind: TermKind.Var, name });
/**
 * Construct a new abstraction term.
 * @param head The bound variable.
 * @param body The body term.
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

/** Get the free variables contained in a term. */
export function freeVars(t: Term): string[] {
  const boundVars: Set<string> = new Set();
  const freeVars: Set<string> = new Set();
  apply((t) => {
    if (t.kind === TermKind.Abs) {
      boundVars.add(t.head);
    } else if (t.kind === TermKind.Var) {
      const variable = t.name;
      if (!boundVars.has(variable)) {
        freeVars.add(variable);
      }
    }
  }, t);

  return Array.from(freeVars);
}
