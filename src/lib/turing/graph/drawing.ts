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
export const NODE_RADIUS = 20;
export const SELF_EDGE_RATIO = 0.75;
export const context = writable();
export const canvas = writable();

const SNAP_THRESHOLD = 10;

export function in_bounds(pos: Vec2d): boolean {
  return pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= height;
}

function rotate(pivot: Vec2d, v: Vec2d, theta: number): Vec2d {
  let temp = minus(v, pivot);
  temp = {
    x: temp.x * Math.cos(theta) - temp.y * Math.sin(theta),
    y: temp.x * Math.sin(theta) + temp.y * Math.cos(theta),
  };
  return plus(temp, pivot);
}

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
  let label: Vec2d;
  const label_dims = context.measureText(edge.label);
  const h = Math.abs(edge.h) > SNAP_THRESHOLD ? edge.h : 0;
  if (edge.head.id !== edge.tail.id) {
    const p1 = edge.tail.pos;
    const p2 = edge.head.pos;
    const v = normed(minus(p2, p1));
    const n = perp(v);
    const mid = plus(p1, times(norm(minus(p2, p1)) / 2, v));
    label = plus(mid, times(h, n));
  } else {
    const node_center = edge.tail.pos;
    const c = {
      x: edge.tail.pos.x,
      y: edge.tail.pos.y - (0.9 + SELF_EDGE_RATIO) * NODE_RADIUS,
    };
    const t = rotate(node_center, c, edge.h);
    label = { x: t.x, y: t.y - NODE_RADIUS * SELF_EDGE_RATIO };
  }
  return {
    top_left: {
      x: label.x - label_dims.width / 2 - TEXT_BOX_MARGIN,
      y: label.y - label_dims.actualBoundingBoxAscent - 2 * TEXT_BOX_MARGIN,
    },
    width: label_dims.width + 2 * TEXT_BOX_MARGIN,
    height: label_dims.actualBoundingBoxAscent + 2 * TEXT_BOX_MARGIN,
  };
}

export function draw_edge_label(
  context: CanvasRenderingContext2D,
  edge: Edge,
  editing: boolean,
  selected: boolean,
) {
  const bounding_box = edge_label_bounding_box(context, edge);
  const text_dims = context.measureText(edge.label);
  const label = {
    x: bounding_box.top_left.x + TEXT_BOX_MARGIN,
    y: bounding_box.top_left.y + text_dims.actualBoundingBoxAscent + TEXT_BOX_MARGIN,
  };

  if (editing) {
    context.setLineDash([5, 5]);
  }
  context.fillStyle = "#1F2937";
  context.fillRect(
    bounding_box.top_left.x,
    bounding_box.top_left.y,
    bounding_box.width,
    bounding_box.height,
  );
  if (selected && !editing) {
    context.strokeStyle = "#727272";
  }
  context.strokeRect(
    bounding_box.top_left.x,
    bounding_box.top_left.y,
    bounding_box.width,
    bounding_box.height,
  );
  context.setLineDash([]);
  context.fillStyle = "#FFFFFF";
  context.strokeStyle = "#FFFFFF";
  context.fillText(edge.label, label.x, label.y);
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

function draw_self_edge(
  context: CanvasRenderingContext2D,
  edge: Edge,
  node_radius: number,
) {
  const node_center = edge.tail.pos;
  const c = {
    x: edge.tail.pos.x,
    y: edge.tail.pos.y - (0.9 + SELF_EDGE_RATIO) * node_radius,
  };
  const t = rotate(node_center, c, edge.h);

  let tip = { x: node_center.x, y: node_center.y - NODE_RADIUS };
  let base = {
    x: node_center.x,
    y: node_center.y - NODE_RADIUS - Math.sqrt((3 * ARROW_SIZE ** 2) / 4),
  };
  const theta = 0.41;
  tip = rotate(node_center, tip, theta + edge.h);
  base = rotate(node_center, base, 1.1 * theta + edge.h);

  context.beginPath();
  context.arc(t.x, t.y, node_radius * SELF_EDGE_RATIO, 0, 2 * Math.PI);
  context.stroke();
  draw_curly_arrow(context, tip, base);
}

export function draw_edge(
  context: CanvasRenderingContext2D,
  edge: Edge,
  node_radius: number,
) {
  if (Math.abs(edge.h) <= SNAP_THRESHOLD && edge.tail.id !== edge.head.id) {
    draw_straight_edge(context, edge, node_radius);
  } else if (edge.head.id === edge.tail.id) {
    draw_self_edge(context, edge, node_radius);
  } else {
    draw_arced_edge(context, edge, node_radius);
  }
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

  if (start_node.pos.x <= width / 2) {
    context.moveTo(start_node.pos.x - node_radius, start_node.pos.y);
    context.lineTo(start_node.pos.x - 3 * node_radius, start_node.pos.y);
    context.stroke();
    const tip = { x: start_node.pos.x - node_radius, y: start_node.pos.y };
    const base = {
      x: start_node.pos.x - node_radius - Math.sqrt((3 * ARROW_SIZE ** 2) / 4),
      y: start_node.pos.y,
    };
    draw_curly_arrow(context, tip, base);
  } else {
    context.moveTo(start_node.pos.x + node_radius, start_node.pos.y);
    context.lineTo(start_node.pos.x + 3 * node_radius, start_node.pos.y);
    context.stroke();
    const tip = { x: start_node.pos.x + node_radius, y: start_node.pos.y };
    const base = {
      x: start_node.pos.x + node_radius + Math.sqrt((3 * ARROW_SIZE ** 2) / 4),
      y: start_node.pos.y,
    };
    draw_curly_arrow(context, tip, base);
  }
}
