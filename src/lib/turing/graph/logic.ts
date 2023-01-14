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
export const dot = (u: Vec2d, v: Vec2d): number => (u.x * v.x + u.y * u.y);
export const angle = (u: Vec2d, v: Vec2d): number => (Math.acos(dot(u, v) / (norm(u) * norm(v))));

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
}

export function remove_edge(edges: Map<number, Edge>, edge_id: number) {
  edges.delete(edge_id);
}
