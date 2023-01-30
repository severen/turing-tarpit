/* eslint-disable @typescript-eslint/no-non-null-assertion */
/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { TM } from "../tm";
import {
  instructions_to_adjacency_matrix,
  spectral_barycenter,
  type AdjMatrixMapping,
  type NodeCoords,
} from "./spectral";

const SCALE = 200;
const WIDTH = 732;

export type Vec2d = { x: number; y: number };
export const plus = (u: Vec2d, v: Vec2d): Vec2d => ({ x: u.x + v.x, y: u.y + v.y });
export const minus = (u: Vec2d, v: Vec2d): Vec2d => ({ x: u.x - v.x, y: u.y - v.y });
export const norm = (u: Vec2d): number => Math.sqrt(u.x ** 2 + u.y ** 2);
export const times = (a: number, u: Vec2d) => ({ x: a * u.x, y: a * u.y });
export const perp = (u: Vec2d) => ({ x: -u.y, y: u.x });
export const normed = (u: Vec2d): Vec2d => times(1 / norm(u), u);
export const dot = (u: Vec2d, v: Vec2d): number => u.x * v.x + u.y * u.y;
export const proj = (u: Vec2d, v: Vec2d): Vec2d => times(dot(u, v) / dot(v, v), v);

const range = (n: number) => [...Array(n).keys()];

export type LabelBoundingBox = { top_left: Vec2d; width: number; height: number };

export type Node = { pos: Vec2d; label: string; is_accept: boolean };
export type Edge = { tail: Node; head: Node; label: string; h: number };
export type TM_Graph = {
  start_node_label: string | null;
  nodes: Map<string, Node>;
  edges: Map<number, Edge>;
  used_node_ids: Set<number>;
  used_edge_ids: Set<number>;
};
export const init_tm_graph = () => ({
  start_node_label: null,
  nodes: new Map<string, Node>(),
  edges: new Map<number, Edge>(),
  used_node_ids: new Set<number>(),
  used_edge_ids: new Set<number>(),
});

export const new_node = (center: Vec2d, label: string): Node => ({
  pos: center,
  label: label,
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

export function instructions_from_graph(graph: TM_Graph): string {
  const start_state_id = graph.start_node_label;
  const nodes = graph.nodes;
  const edges = graph.edges;
  const start_state = start_state_id === null ? "" : nodes.get(start_state_id)?.label;
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
      if (node.label === edge.tail.label) {
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

// Return true if p2 is above p1
export function above(p1: Vec2d, p2: Vec2d): boolean {
  return p2.y >= p1.y;
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
  nodes: Map<string, Node>,
  edges: Map<number, Edge>,
  used_node_ids: Set<number>,
  node_label: string,
) {
  //Remove edges that the node is the tail of
  for (const [id, edge] of edges.entries()) {
    if (edge.tail.label === node_label || edge.head.label === node_label) {
      edges.delete(id);
    }
  }
  //Remove node from node set
  nodes.delete(node_label);
  //used_node_ids.delete(node_id);
}

export function remove_edge(edges: Map<number, Edge>, edge_id: number) {
  edges.delete(edge_id);
}

function place_node(
  label: string,
  node_coords: NodeCoords,
  label_index: Map<string, number>,
): Node {
  const pos = {
    x: node_coords.x_coords[label_index.get(label)!] * 1.5 * SCALE + WIDTH / 2,
    y: node_coords.y_coords[label_index.get(label)!] * SCALE + WIDTH / 4,
  };
  return new_node(pos, label);
}

export function graph_from_tm(tm: TM, instructions: string): TM_Graph {
  const adj_mat_map = instructions_to_adjacency_matrix(instructions);
  const node_coords = spectral_barycenter(adj_mat_map.A);
  const nodes = new Map<string, Node>();
  const edges = new Map<number, Edge>();
  const in_graph = new Set<string>();
  let num_nodes = 0;
  let num_edges = 0;
  for (const [head, arcs] of tm.delta.entries()) {
    let head_node: Node;
    //Add head node into graph
    if (!nodes.has(head)) {
      num_nodes++;
      head_node = place_node(head, node_coords, adj_mat_map.label_index);
      nodes.set(head, head_node);
      in_graph.add(head);
    } else {
      head_node = nodes.get(head)!;
    }
    for (const [read, arc] of arcs.entries()) {
      //Add tail into graph if its not in there already
      const tail = arc.next;
      let tail_node: Node;
      if (!in_graph.has(tail)) {
        num_nodes++;
        tail_node = place_node(tail, node_coords, adj_mat_map.label_index);
        nodes.set(tail, tail_node);
        in_graph.add(tail);
      } else {
        tail_node = nodes.get(tail)!;
      }
      const edge = new_edge(head_node, tail_node);
      edge.label = `${read}, ${arc.write}, ${arc.move}`;
      edges.set(++num_edges, edge);
    }
  }
  //Set accept states
  for (const label of tm.accept_states) {
    nodes.get(label)!.is_accept = true;
  }

  return {
    start_node_label: tm.start_state,
    nodes,
    edges,
    used_node_ids: new Set(range(num_nodes + 1)),
    used_edge_ids: new Set(range(num_edges + 1)),
  };
}
