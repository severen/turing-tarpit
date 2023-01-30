/* eslint-disable @typescript-eslint/no-explicit-any */
/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  zeros,
  matrix,
  diag,
  multiply,
  add,
  random,
  norm,
  divide,
  dot,
  subtract,
  type Matrix,
} from "mathjs";

const EPSILON = 10 ** -7;
const MAX_ITERS = 100;

export type AdjMatrixMapping = { A: Matrix; label_index: Map<string, number> };
export type NodeCoords = { x_coords: Array<number>; y_coords: Array<number> };

function row_sums(A: Matrix): Array<number> {
  const [m, n] = A.size();
  const out: Array<number> = Array(m);
  for (let i = 0; i < m; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += A.get([i, j]);
    }
    out[i] = sum;
  }
  return out;
}

function to_array(v: Matrix): Array<number> {
  const out = Array(v.size()[0]).fill(0);
  for (let i = 0; i < out.length; i++) {
    out[i] = v.get([i]);
  }
  return out;
}

function normalize(x: any): Matrix {
  return multiply(divide(1, norm(x)), x);
}

function proj(A: Matrix, u: Matrix, v: Matrix): Matrix {
  return multiply(dot(u, multiply(A, v)) / dot(v, multiply(A, v)), v);
}

export function instructions_to_adjacency_matrix(
  instructions: string,
): AdjMatrixMapping {
  const nodes: Set<string> = new Set();
  const label_index: Map<string, number> = new Map();
  // Add all states in to a set
  for (const [i, line] of instructions.split("\n").entries()) {
    if (i === 0) {
      for (const n of line.trim().split(" ")) {
        nodes.add(n);
      }
    } else {
      const [tail, , , , head] = line.trim().split(" ");
      nodes.add(tail);
      nodes.add(head);
    }
  }
  // Sort alphabetically into map
  for (const [i, label] of Array.from(nodes.values())
    .sort((s1, s2) => s1.localeCompare(s2))
    .entries()) {
    label_index.set(label, i);
  }
  // Create adjacency_matrix
  const n = nodes.size;
  const A: Matrix = matrix(zeros([n, n]));
  for (const [i, line] of instructions.split("\n").entries()) {
    if (i !== 0) {
      const [tail, , , , head] = line.trim().split(" ");
      if (tail !== head) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        A.set([label_index.get(head)!, label_index.get(tail)!], 1);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        A.set([label_index.get(tail)!, label_index.get(head)!], 1);
      }
    }
  }
  return { A, label_index };
}

export function spectral_barycenter(A: Matrix): NodeCoords {
  const m = A.size()[0];
  const degrees = row_sums(A);
  const D = diag(degrees);
  const D_inverse = diag(degrees.map((d: number) => 1 / d));
  const ones = matrix(Array(m).fill(1));
  const I = diag(ones);
  const PM = multiply(1 / 2, add(I, multiply(D_inverse, A)));
  const v = [ones, ones, ones];
  for (const i of [1, 2]) {
    let x_k = matrix(random([m]));
    x_k = normalize(x_k);
    let iters = 0;
    while (iters === 0 || (dot(x_k, v[i]) < 1 - EPSILON && iters < MAX_ITERS)) {
      iters++;
      v[i] = x_k;
      for (let j = 0; j < i; j++) {
        v[i] = subtract(v[i], proj(D, x_k, v[j]));
      }
      x_k = multiply(PM, v[i]);
      if (norm(x_k) <= EPSILON) {
        // The eigen vector is zero all nodes are on a line
        break;
      }
      x_k = normalize(x_k);
    }
    v[i] = x_k;
  }
  for (const vec of v) {
    console.log(vec.format());
  }
  return { x_coords: to_array(v[1]), y_coords: to_array(v[2]) };
}
