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
export const normed = (u: Vec2d) => times(1 / norm(u), u);

export type LabelBoundingBox = { top_left: Vec2d; width: number; height: number };

export type Node = { pos: Vec2d; label: string };
export type Edge = { node1: Node; node2: Node; label: string; h: number };

export const new_node = (center: Vec2d): Node => ({ pos: center, label: "" });
export const new_edge = (node1: Node, node2: Node): Edge => ({
  node1,
  node2,
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
