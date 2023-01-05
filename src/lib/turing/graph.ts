/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getContext, onMount, onDestroy } from "svelte";
import { writable, derived } from "svelte/store";

export const width = 732;
export const height = 172;
export const ARROW_SIZE = 10;
export const context = writable();
export const canvas = writable();

export type Vec2d = { x: number; y: number };
export const plus = (u: Vec2d, v: Vec2d): Vec2d => ({x: u.x + v.x, y: u.y + v.y});
export const minus = (u: Vec2d, v: Vec2d): Vec2d => ({x: u.x - v.x, y: u.y - v.y});
export const norm = (u: Vec2d): number => (Math.sqrt(u.x**2 + u.y**2));
export const times = (a: number, u: Vec2d) => ({x: a * u.x, y: a * u.y});
export const perp = (u: Vec2d) => ({x: -u.y, y: u.x});

export type Node = { pos: Vec2d; label: string};

export type Edge = { node1: Node, node2: Node, label: string, h: number};

export const new_node = (center: Vec2d): Node => ({ pos: center, label: ""});
export const new_edge = (node1: Node, node2: Node): Edge => ({node1, node2, label: "", h: 0});

function draw_straight_edge(context: CanvasRenderingContext2D, edge: Edge, node_radius: number) {
  context.strokeStyle = "#FFFFFF";
  //context.fillStyle = "#FFFFFF";

  const s = ARROW_SIZE;
  let p1 = edge.node1.pos;
  let p2 = edge.node2.pos;
  let p1_to_p2 = minus(p2, p1);
  const dist = norm(p1_to_p2);
  p1_to_p2 = times(1/dist, p1_to_p2);
  p1 = plus(p1, times(node_radius, p1_to_p2));
  p2 = plus(p1, times((dist - 2*node_radius), p1_to_p2));
  const p2_draw = plus(p1, times((dist - 2*node_radius) - 5, p1_to_p2));
  const m = minus(p2, times(Math.sqrt((3*s**2)/4), p1_to_p2));
  const b = plus(m, times(2*s/3, perp(p1_to_p2)));
  const c = plus(m, times(-2*s/3, perp(p1_to_p2)));

  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2_draw.x, p2_draw.y);
  context.closePath();
  context.stroke();

  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(p2.x, p2.y);
  context.quadraticCurveTo(m.x, m.y, b.x, b.y);
  context.stroke();

  context.beginPath();
  context.moveTo(p2.x, p2.y);
  context.quadraticCurveTo(m.x, m.y, c.x, c.y);
  context.stroke();
}

export function draw_edge(context: CanvasRenderingContext2D, edge: Edge, node_radius: number) {
  if (edge.h === 0) {
    draw_straight_edge(context, edge, node_radius);
  }
}
