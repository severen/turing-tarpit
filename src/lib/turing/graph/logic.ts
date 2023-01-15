/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export type Vec2d = { x: number; y: number };
export const plus = (u: Vec2d, v: Vec2d): Vec2d => ({ x: u.x + v.x, y: u.y + v.y });
export const minus = (u: Vec2d, v: Vec2d): Vec2d => ({ x: u.x - v.x, y: u.y - v.y });
export const norm = (u: Vec2d): number => Math.sqrt(u.x ** 2 + u.y ** 2);
export const times = (a: number, u: Vec2d) => ({ x: a * u.x, y: a * u.y });
export const perp = (u: Vec2d) => ({ x: -u.y, y: u.x });
export const normed = (u: Vec2d): Vec2d => times(1 / norm(u), u);
export const dot = (u: Vec2d, v: Vec2d): number => u.x * v.x + u.y * u.y;
export const proj = (u: Vec2d, v: Vec2d): Vec2d => times(dot(u, v) / dot(v, v), v);

export type LabelBoundingBox = { top_left: Vec2d; width: number; height: number };

export type Node = { id: number; pos: Vec2d; label: string; is_accept: boolean };
export type Edge = { tail: Node; head: Node; label: string; h: number };

export const new_node = (id: number, center: Vec2d): Node => ({
  id,
  pos: center,
  label: "",
  is_accept: false,
});
export const new_edge = (tail: Node, head: Node): Edge => ({
  tail,
  head,
  label: "",
  h: 0,
});

function parse_edge_label(label: string): string {
  return label
    .split(",")
    .map((s: string) => s.trim())
    .join(" ");
}

export function instructions_from_graph(
  start_state_id: number,
  nodes: Map<number, Node>,
  edges: Map<number, Edge>,
): string {
  const start_state =
    nodes.get(start_state_id) === undefined ? "" : nodes.get(start_state_id)?.label;
  const accept_states = [...nodes.values()]
    .filter((node: Node) => node.is_accept)
    .sort((n1: Node, n2: Node) => n1.label.localeCompare(n2.label));
  let instructs =
    start_state +
    " " +
    [...accept_states.map((node: Node) => node.label)].join(" ") +
    "\n";
  for (const node of [...nodes.values()].sort((n1: Node, n2: Node) =>
    n1.label.localeCompare(n2.label),
  )) {
    for (const edge of edges.values()) {
      if (node.id === edge.tail.id) {
        instructs = instructs.concat(
          `${edge.tail.label} ${parse_edge_label(edge.label)} ${edge.head.label}\n`,
        );
      }
    }
  }
  return instructs;
}

// Return true if p2 is on the left of p1
export function on_left(p1: Vec2d, p2: Vec2d): boolean {
  return p2.x <= p1.x;
}

export function bearing_from_node(node: Node, mouse: Vec2d): number {
  const theta = Math.acos((node.pos.y - mouse.y) / norm(minus(mouse, node.pos)));
  if (on_left(node.pos, mouse)) {
    return -theta;
  } else {
    return -(2 * Math.PI - theta);
  }
}

export function in_circle(center: Vec2d, radius: number, mouse: Vec2d): boolean {
  return (center.x - mouse.x) ** 2 + (center.y - mouse.y) ** 2 <= radius ** 2;
}

export function in_rect(top_left: Vec2d, w: number, h: number, mouse: Vec2d): boolean {
  return (
    mouse.x >= top_left.x &&
    mouse.x <= top_left.x + w &&
    mouse.y >= top_left.y &&
    mouse.y <= top_left.y + h
  );
}

export function remove_node(
  nodes: Map<number, Node>,
  edges: Map<number, Edge>,
  used_node_ids: Set<number>,
  node_id: number,
) {
  //Remove edges that the node is the tail of
  for (const [id, edge] of edges.entries()) {
    if (edge.tail.id === node_id || edge.head.id === node_id) {
      edges.delete(id);
    }
  }
  //Remove node from node set
  nodes.delete(node_id);
  used_node_ids.delete(node_id);
}

export function remove_edge(edges: Map<number, Edge>, edge_id: number) {
  edges.delete(edge_id);
}
