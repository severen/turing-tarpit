/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getContext, onMount, onDestroy } from "svelte";
import { writable, derived } from "svelte/store";
import {
  minus,
  norm,
  normed,
  perp,
  plus,
  times,
  type Node,
  type Edge,
  type LabelBoundingBox,
  type Vec2d,
} from "./logic";

export const width = 732;
export const height = 2 * 172;
export const ARROW_SIZE = 10;
export const TEXT_BOX_MARGIN = 5;
export const context = writable();
export const canvas = writable();

function draw_curly_arrow(context: CanvasRenderingContext2D, tip: Vec2d, base: Vec2d) {
  context.lineWidth = 1.5;
  const s = ARROW_SIZE;
  const base_to_tip = times(1 / norm(minus(base, tip)), minus(base, tip));
  const b = plus(base, times((2 * s) / 3, perp(base_to_tip)));
  const c = plus(base, times((-2 * s) / 3, perp(base_to_tip)));

  context.beginPath();
  context.moveTo(tip.x, tip.y);
  context.quadraticCurveTo(base.x, base.y, b.x, b.y);
  context.stroke();

  context.beginPath();
  context.moveTo(tip.x, tip.y);
  context.quadraticCurveTo(base.x, base.y, c.x, c.y);
  context.stroke();
}

export function edge_label_bounding_box(
  context: CanvasRenderingContext2D,
  edge: Edge,
): LabelBoundingBox {
  const label_dims = context.measureText(edge.label);
  const p1 = edge.tail.pos;
  const p2 = edge.head.pos;
  const v = normed(minus(p2, p1));
  const n = perp(v);
  const mid = plus(p1, times(norm(minus(p2, p1)) / 2, v));
  const label = plus(mid, times(edge.h, n));
  return {
    top_left: {
      x: label.x - label_dims.width / 2 - TEXT_BOX_MARGIN,
      y: label.y - label_dims.actualBoundingBoxAscent - 2 * TEXT_BOX_MARGIN,
    },
    width: label_dims.width + 2 * TEXT_BOX_MARGIN,
    height: label_dims.actualBoundingBoxAscent + 2 * TEXT_BOX_MARGIN,
  };
}

function draw_edge_label(
  context: CanvasRenderingContext2D,
  edge: Edge,
  editing: boolean,
  selected: boolean,
) {
  const p1 = edge.tail.pos;
  const p2 = edge.head.pos;
  const v = normed(minus(p2, p1));

  const n = perp(v);
  const mid = plus(p1, times(norm(minus(p2, p1)) / 2, v));
  const label = plus(mid, times(edge.h, n));

  const TEXT_BOX_MARGIN = 5;
  const label_dims = context.measureText(edge.label);
  const width = label_dims.width;
  const height = label_dims.actualBoundingBoxAscent;

  if (editing) {
    context.setLineDash([5, 5]);
  }
  context.fillStyle = "#1F2937";
  context.fillRect(
    label.x - width / 2 - TEXT_BOX_MARGIN,
    label.y - height - 2 * TEXT_BOX_MARGIN,
    width + 2 * TEXT_BOX_MARGIN,
    height + 2 * TEXT_BOX_MARGIN,
  );
  if (selected && !editing) {
    context.strokeStyle = "#727272";
  }
  context.strokeRect(
    label.x - width / 2 - TEXT_BOX_MARGIN,
    label.y - height - 2 * TEXT_BOX_MARGIN,
    width + 2 * TEXT_BOX_MARGIN,
    height + 2 * TEXT_BOX_MARGIN,
  );
  context.setLineDash([]);
  context.fillStyle = "#FFFFFF";
  context.strokeStyle = "#FFFFFF";
  context.fillText(edge.label, label.x - width / 2, label.y - TEXT_BOX_MARGIN);
}

function draw_straight_edge(
  context: CanvasRenderingContext2D,
  edge: Edge,
  node_radius: number,
) {
  context.strokeStyle = "#FFFFFF";
  context.fillStyle = "#FFFFFF";
  const s = ARROW_SIZE;

  let p1 = edge.tail.pos;
  let p2 = edge.head.pos;
  let p1_to_p2 = minus(p2, p1);
  const dist = norm(p1_to_p2);
  p1_to_p2 = times(1 / dist, p1_to_p2);

  p1 = plus(p1, times(node_radius, p1_to_p2));
  p2 = plus(p1, times(dist - 2 * node_radius, p1_to_p2));
  const p2_draw = plus(p1, times(dist - 2 * node_radius - 5, p1_to_p2));
  const m = minus(p2, times(Math.sqrt((3 * s ** 2) / 4), p1_to_p2));

  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2_draw.x, p2_draw.y);
  context.closePath();
  context.stroke();
  draw_curly_arrow(context, p2, m);
}

function draw_arced_edge(
  context: CanvasRenderingContext2D,
  edge: Edge,
  node_radius: number,
) {
  context.strokeStyle = "#FFFFFF";
  const s = ARROW_SIZE;
  const n = perp(normed(minus(edge.head.pos, edge.tail.pos)));
  const mid = times(1 / 2, plus(edge.tail.pos, edge.head.pos));
  const c = plus(mid, times(2 * edge.h, n));

  const p2_to_c = normed(minus(c, edge.head.pos));
  const tip = plus(edge.head.pos, times(node_radius, p2_to_c));
  const base = plus(
    edge.head.pos,
    times(node_radius + Math.sqrt((3 * s ** 2) / 4), p2_to_c),
  );

  context.beginPath();
  context.moveTo(edge.head.pos.x, edge.head.pos.y);
  context.quadraticCurveTo(c.x, c.y, edge.tail.pos.x, edge.tail.pos.y);
  context.stroke();
  draw_curly_arrow(context, tip, base);
}

export function draw_edge(
  context: CanvasRenderingContext2D,
  edge: Edge,
  node_radius: number,
  editing: boolean,
  selected: boolean,
) {
  if (edge.h === 0) {
    draw_straight_edge(context, edge, node_radius);
  } else {
    draw_arced_edge(context, edge, node_radius);
  }
  draw_edge_label(context, edge, editing, selected);
}

export function draw_node(
  context: CanvasRenderingContext2D,
  node: Node,
  node_radius: number,
  editing: boolean,
  selected: boolean,
) {
  //Draw over arcs
  context.fillStyle = "#1F2937";
  context.beginPath();
  context.arc(node.pos.x, node.pos.y, node_radius, 0, 2 * Math.PI, true);
  context.closePath();
  context.fill();

  if (selected && !editing) {
    context.strokeStyle = "#727272";
  } else {
    context.strokeStyle = "#FFFFFF";
    if (editing) {
      context.setLineDash([5, 5]);
    }
  }
  //Draw outlines
  context.beginPath();
  context.arc(node.pos.x, node.pos.y, node_radius, 0, 2 * Math.PI, true);
  context.closePath();
  context.stroke();
  if (node.is_accept) {
    context.beginPath();
    context.arc(node.pos.x, node.pos.y, node_radius - 4, 0, 2 * Math.PI, true);
    context.stroke();
  }
  context.fillText(node.label, node.pos.x, node.pos.y);
  context.setLineDash([]);

  //Draw label
  context.fillStyle = "#FFFFFF";
  context.strokeStyle = "#FFFFFF";
  const label_dims = context.measureText(node.label);
  const w = label_dims.width;
  const h = label_dims.actualBoundingBoxAscent;
  context.fillText(node.label, node.pos.x - w / 2, node.pos.y + h / 2);
}

export function draw_start_arrow(
  context: CanvasRenderingContext2D,
  start_node: Node,
  node_radius: number,
) {
  context.beginPath();
  context.moveTo(start_node.pos.x - node_radius, start_node.pos.y);
  context.lineTo(start_node.pos.x - 3 * node_radius, start_node.pos.y);
  context.stroke();
  const tip = { x: start_node.pos.x - node_radius, y: start_node.pos.y };
  const base = {
    x: start_node.pos.x - node_radius - Math.sqrt((3 * ARROW_SIZE ** 2) / 4),
    y: start_node.pos.y,
  };
  draw_curly_arrow(context, tip, base);
}
