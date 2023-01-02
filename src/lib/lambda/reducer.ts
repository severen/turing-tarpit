/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { mkAbs, mkApp, TermKind, type Abs, type Term } from "$lib/lambda/syntax";

/**
 * A term that is only legal as the body of an abstraction.
 *
 * In other words, a `Scope` is the only kind of term that may contain bound variables
 * pointing to nonexistent binders. Since `Scope` is only a type alias for `Term`, this
 * convention must be manually ensured throughout the reducer.
 */
type Scope = Term;

/** Perform one normal order reduction step. */
export function step(t: Term): Term {
  const go = (t: Term): { t: Term; contracted: boolean } => {
    switch (t.kind) {
      case TermKind.FVar:
      case TermKind.BVar:
        return { t, contracted: false };
      case TermKind.Abs:
        return { t: mkAbs(t.head, go(t.body).t), contracted: false };
      case TermKind.App: {
        if (t.left.kind === TermKind.Abs) {
          return { t: instantiate(t.right, open(t.left)), contracted: true };
        }

        const { t: left, contracted } = go(t.left);
        const right = !contracted ? go(t.right).t : t.right;
        return { t: mkApp(left, right), contracted: false };
      }
    }
  };

  return go(t).t;
}

export function reduce(t: Term): Term {
  let s = step(t);
  for (let i = 0; i < 10; ++i) {
    s = step(s);
  }

  return s;
}

/** Open the body of an abstraction for instantiation. */
function open(f: Abs): Scope {
  return f.body;
}

export function instantiate(image: Term, scope: Scope): Term {
  const replace = (outer: number, t: Term): Term => {
    switch (t.kind) {
      case TermKind.FVar:
        return t;
      case TermKind.BVar:
        return t.index === outer ? image : t;
      case TermKind.Abs:
        return mkAbs(t.head, replace(outer + 1, t.body));
      case TermKind.App:
        return mkApp(replace(outer, t.left), replace(outer, t.right));
    }
  };

  return replace(0, scope);
}

// book example (\x -> x) ((\x -> x) (\z -> (\x -> x) z))
// (\x -> x) (\x -> (\s -> s m) ((\x -> x) n))
// (\f x -> f x) (\f x -> f (f x)) => (\x -> (\f x -> f (f x)) x)
