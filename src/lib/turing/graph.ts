/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getContext, onMount, onDestroy } from "svelte";
import { writable, derived } from "svelte/store";
import type { E } from "vitest/dist/types-de0e0997";

export const width = 732;
export const height = 2*172;
export const ARROW_SIZE = 10;
export const TEXT_BOX_MARGIN = 5;
export const context = writable();
export const canvas = writable();

export type Vec2d = { x: number; y: number };
export const plus = (u: Vec2d, v: Vec2d): Vec2d => ({x: u.x + v.x, y: u.y + v.y});
export const minus = (u: Vec2d, v: Vec2d): Vec2d => ({x: u.x - v.x, y: u.y - v.y});
export const norm = (u: Vec2d): number => (Math.sqrt(u.x**2 + u.y**2));
export const times = (a: number, u: Vec2d) => ({x: a * u.x, y: a * u.y});
export const perp = (u: Vec2d) => ({x: -u.y, y: u.x});
export const normed = (u: Vec2d) => (times(1/norm(u), u));

export type LabelBoundingBox = { top_left: Vec2d, width: number, height: number};

export type Node = { pos: Vec2d; label: string};

export type Edge = { node1: Node, node2: Node, label: string, h: number};

export const new_node = (center: Vec2d): Node => ({ pos: center, label: ""});
export const new_edge = (node1: Node, node2: Node): Edge => ({node1, node2, label: "q0, a, b, R", h: 0});

function draw_curly_arrow(context: CanvasRenderingContext2D, tip: Vec2d, base: Vec2d) {
  context.lineWidth = 1.5;
  const s = ARROW_SIZE;
  const base_to_tip = times(1/norm(minus(base, tip)), minus(base, tip));
  const b = plus(base, times(2*s/3, perp(base_to_tip)));
  const c = plus(base, times(-2*s/3, perp(base_to_tip)));

  context.beginPath();
  context.moveTo(tip.x, tip.y);
  context.quadraticCurveTo(base.x, base.y, b.x, b.y);
  context.stroke();

  context.beginPath();
  context.moveTo(tip.x, tip.y);
  context.quadraticCurveTo(base.x, base.y, c.x, c.y);
  context.stroke();
}

export function edge_label_bounding_box(context: CanvasRenderingContext2D, edge: Edge): LabelBoundingBox {
  const label_dims = context.measureText(edge.label);
  const p1 = edge.node1.pos;
  const p2 = edge.node2.pos;
  const v = normed(minus(p2, p1));
  const n = perp(v);
  const mid = plus(p1, times(norm(minus(p2, p1))/2, v));
  const label = plus(mid, times(edge.h, n));
  return {
    top_left: {x: label.x - label_dims.width/2 - TEXT_BOX_MARGIN, y: label.y - label_dims.actualBoundingBoxAscent - 2 * TEXT_BOX_MARGIN},
    width: label_dims.width + 2*TEXT_BOX_MARGIN,
    height: label_dims.actualBoundingBoxAscent + 2*TEXT_BOX_MARGIN
  };
}


function draw_edge_label(context: CanvasRenderingContext2D, edge: Edge, editing: boolean) {
  const p1 = edge.node1.pos;
  const p2 = edge.node2.pos;
  const v = normed(minus(p2, p1));

  const n = perp(v);
  const mid = plus(p1, times(norm(minus(p2, p1))/2, v));
  const label = plus(mid, times(edge.h, n));

  const TEXT_BOX_MARGIN = 5;
  const label_dims = context.measureText(edge.label);
  const width = label_dims.width;
  const height = label_dims.actualBoundingBoxAscent;

  if (editing) {
    context.setLineDash([5, 5]);
  }
  context.fillStyle = "#1F2937";
  context.fillRect(label.x - width/2 - TEXT_BOX_MARGIN, label.y - height - 2 * TEXT_BOX_MARGIN, width + 2 * TEXT_BOX_MARGIN, height + 2 * TEXT_BOX_MARGIN);
  context.strokeRect(label.x - width/2 - TEXT_BOX_MARGIN, label.y - height - 2 * TEXT_BOX_MARGIN, width + 2 * TEXT_BOX_MARGIN, height + 2 * TEXT_BOX_MARGIN);
  context.setLineDash([]);
  context.fillStyle = "#FFFFFF";
  context.fillText(edge.label, label.x - width/2, label.y - TEXT_BOX_MARGIN);

}

function draw_straight_edge(context: CanvasRenderingContext2D, edge: Edge, node_radius: number, editing: boolean) {
  context.strokeStyle = "#FFFFFF";
  context.fillStyle = "#FFFFFF";
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

  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2_draw.x, p2_draw.y);
  context.closePath();
  context.stroke();
  draw_curly_arrow(context, p2, m);
  draw_edge_label(context, edge, editing);



}

export function draw_edge(context: CanvasRenderingContext2D, edge: Edge, node_radius: number, editing: boolean) {
  draw_straight_edge(context, edge, node_radius, editing);

}
