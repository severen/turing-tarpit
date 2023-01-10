/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  freeVars,
  mkAbs,
  mkApp,
  mkVar,
  TermKind,
  type Abs,
  type Name,
  type Term,
} from "$lib/lambda/syntax";

/**
 * Perform reduction on a term until no more reductions are possible.
 * @param t The term to evaluate.
 * @returns The reduction steps taken to evaluate `t`.
 */
export function evaluate(t: Term): Term[] {
  const steps = [t, reduce(t)[0]];
  for (let i = 1; ; ++i) {
    const [s, wasContracted] = reduce(steps[i]);

    // If reduction gives the same term twice, then there are no more β-redexes and we
    // can stop evaluating. Also note the use of isEqual from lodash over ===, which we
    // use for _structural_ equality instead of _referential_ equality. One would expect
    // JavaScript to have such a function built in, but unfortunately it still sucks.
    if (wasContracted) {
      steps.push(s);
    } else {
      return steps;
    }
  }
}

// TODO: Profile this to see just how slow it is in comparison to my implementation in
//       Haskell (severen/sly).
/**
 * Perform one step of normal order β-reduction within a term, if possible.
 * @param t The term in which to perform β-reduction.
 * @returns A list R in which R[0] is the resultant term and R[1] indicates whether a
 * contraction has occured.
 */
export function reduce(t: Term): [Term, boolean] {
  // So that we can enforce leftmost-to-rightmost evaluation of redexes, we keep track
  // of whether a contraction has ocurred with the use of the second parameter.
  switch (t.kind) {
    case TermKind.Var:
      return [t, false];
    case TermKind.Abs: {
      const [body, wasContracted] = reduce(t.body);
      return [mkAbs(t.head, body), wasContracted];
    }
    case TermKind.App: {
      if (t.left.kind === TermKind.Abs) {
        return [subst(t.left.head, t.right, t.left.body), true];
      }

      // If the left-hand term of the application has not been contracted, then we
      // try to reduce the right-hand term instead.
      const [left, wasLeftContracted] = reduce(t.left);
      const [right, wasRightContracted] = wasLeftContracted
        ? [t.right, false]
        : reduce(t.right);
      return [mkApp(left, right), wasLeftContracted || wasRightContracted];
    }
  }
}

/**
 * Replace all free occurences of the variable `x` in a term `t` with the term `s`.
 *
 * To avoid variable capture, bound variables are renamed when necessary.
 *
 * @param x The variable to replace with `s`.
 * @param s The term to replace `x`.
 * @param t The term in which to perform the replacement `x -> s`.
 */
export function subst(x: Name, s: Term, t: Term): Term {
  const fvs = freeVars(s);

  const go = (t: Term): Term => {
    switch (t.kind) {
      case TermKind.Var:
        if (x === t.name) {
          return s;
        }
        return t;
      case TermKind.Abs: {
        if (x === t.head) {
          return t;
        } else if (x !== t.head && !fvs.has(t.head)) {
          return mkAbs(t.head, go(t.body));
        }
        const newHead = chooseName(t.head, new Set([t.head, ...freeVars(t.body)]));
        return go(rename(newHead, t));
      }
      case TermKind.App:
        return mkApp(go(t.left), go(t.right));
    }
  };

  return go(t);
}

/**
 * Rename the bound variable in the abstraction `f` to the name `x`, if possible.
 * @param x The new name for the bound variable of `f`.
 * @param f The abstraction on which to perform renaming.
 */
function rename(x: Name, f: Abs): Abs {
  if (!freeVars(f.body).has(x)) {
    return mkAbs(x, subst(f.head, mkVar(x), f.body));
  }

  return f;
}

/**
 * Choose a name derived from `x` that is not one of the names in `ys`.
 * @param x The name from which to derive a new name.
 * @param ys The names to avoid clashing with.
 */
function chooseName(x: Name, ys: Set<Name>): Name {
  let z = x + "'";
  for (let i = 1; ys.has(z); ++i) {
    if (i < 3) {
      z += "'";
    } else {
      z = x + i.toString();
    }
  }

  return z;
}
