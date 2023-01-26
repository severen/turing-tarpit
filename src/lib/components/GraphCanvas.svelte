<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { onMount, onDestroy, setContext } from "svelte";
  import {
    draw_edge,
    edge_label_bounding_box,
    draw_node,
    draw_start_arrow,
    draw_edge_label,
    in_bounds,
  } from "$lib/turing/graph/drawing";
  import {
    in_circle,
    in_rect,
    new_node,
    type Node,
    type Edge,
    type Vec2d,
    new_edge,
    remove_node,
    remove_edge,
    bearing_from_node,
    on_left,
    instructions_from_graph,
    type TM_Graph,
    above,
    init_tm_graph,
  } from "$lib/turing/graph/logic";

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  let mouse = { x: 0, y: 0 };
  let last_mouse = { x: 0, y: 0 };
  let node_moving = false;
  let edge_moving = false;
  let node_radius = 20;

  let mouse_down = false;
  let last_mouse_down: number;
  let moving_node_index: number;
  let moving_edge_index: number;

  let edit_node_index = -1;
  let edit_edge_index = -1;
  let last_clicked_node = -1;
  let last_clicked_edge = -1;

  export let graph = init_tm_graph();

  onMount(() => {
    canvas.width = 732;
    canvas.height = canvas.width * 0.5;
    context = canvas.getContext("2d")!;
    context.font = "15px mono";
    redraw();
  });

  // Return the smallest non negative integer that is not in used_node_ids
  function new_id(used: Set<number>): number {
    let i = 0;
    while (used.has(i)) {
      i++;
    }
    used.add(i);
    return i;
  }

  // Return the id of the node the mouse is in, otherwise return -1
  function selected_node(nodes: Map<number, Node>, mouse: Vec2d): number {
    for (const [id, node] of nodes.entries()) {
      if (in_circle(node.pos, node_radius, mouse)) {
        return id;
      }
    }
    return -1;
  }

  // Return the id of the edge the mouse is in the label in, otherwise return -1
  function selected_edge(edges: Map<number, Edge>, mouse: Vec2d): number {
    for (const [i, edge] of edges.entries()) {
      const edge_box = edge_label_bounding_box(context, edge);
      if (in_rect(edge_box.top_left, edge_box.width, edge_box.height, mouse)) {
        return i;
      }
    }
    return -1;
  }

  function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2;

    //Draw edges
    for (const [i, edge] of graph.edges.entries()) {
      draw_edge(context, edge, node_radius);
    }

    //Draw nodes
    for (const [id, node] of graph.nodes.entries()) {
      draw_node(
        context,
        node,
        node_radius,
        id === edit_node_index,
        id === last_clicked_node,
      );
    }
    //Draw edge labels
    for (const [id, edge] of graph.edges.entries()) {
      draw_edge_label(context, edge, id === edit_edge_index, id === last_clicked_edge);
    }

    if (graph.start_node_id >= 0 && graph.nodes.has(graph.start_node_id)) {
      draw_start_arrow(context, graph.nodes.get(graph.start_node_id)!, node_radius);
    }
  }

  function double_click(): boolean {
    const dt = performance.now() - last_mouse_down;
    return dt > 0 && dt < 250;
  }

  function mouse_moved(): boolean {
    return mouse.x !== last_mouse.x || mouse.y !== last_mouse.y;
  }

  function handle_mouse_move({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) {
    const rect = canvas.getBoundingClientRect();
    const last_x = mouse.x;
    const last_y = mouse.y;
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
    let dx = mouse.x - last_x;
    let dy = mouse.y - last_y;
    if (node_moving && in_bounds(canvas, mouse)) {
      graph.nodes.get(moving_node_index)!.pos.x += dx;
      graph.nodes.get(moving_node_index)!.pos.y += dy;
    }
    if (edge_moving && in_bounds(canvas, mouse)) {
      const head = graph.edges.get(moving_edge_index)!.head;
      const tail = graph.edges.get(moving_edge_index)!.tail;
      if (head.id !== tail.id) {
        if (!on_left(head.pos, tail.pos) && !above(head.pos, tail.pos)) {
          dx = -dx;
          dy = -dy;
        }
        graph.edges.get(moving_edge_index)!.h += Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      } else {
        const node = graph.edges.get(moving_edge_index)!.head;
        graph.edges.get(moving_edge_index)!.h = bearing_from_node(node, mouse);
      }
    }

    if (mouse_down) {
      redraw();
    }
  }

  function handle_mouse_down(event: any) {
    mouse_down = true;
    const selected_node_index = selected_node(graph.nodes, mouse);
    const selected_edge_index = selected_edge(graph.edges, mouse);

    // Move node with mouse
    if (selected_node_index >= 0) {
      node_moving = true;
      moving_node_index = selected_node_index;
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;
    }

    //Move edge with mouse
    if (selected_edge_index >= 0) {
      edge_moving = true;
      moving_edge_index = selected_edge_index;
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;
    }

    //handle_mouse_move(event);
    if (double_click()) {
      if (selected_node_index >= 0) {
        // Edit node label
        edit_node_index = selected_node_index;
        edit_edge_index = -1;
      } else if (selected_edge_index >= 0) {
        // Edit edge label
        edit_edge_index = selected_edge_index;
        edit_node_index = -1;
      } else {
        // Create a new node
        const id = new_id(graph.used_node_ids);
        graph.nodes.set(id, new_node(id, { x: mouse.x, y: mouse.y }));
        console.log(graph.nodes.get(id)!.pos.x, graph.nodes.get(id)!.pos.y);
        console.log(mouse.x, mouse.y);
        graph.nodes.get(id)!.label = `q${id}`;
        //Unselect
        edit_node_index = -1;
        last_clicked_node = -1;
        edit_edge_index = -1;
      }
    } else {
      // Unselect nodes and edges
      edit_node_index = -1;
      edit_edge_index = -1;
      last_clicked_edge = -1;
    }
    last_mouse_down = performance.now();
    redraw();
  }

  function handle_mouse_up(event: any) {
    handle_mouse_move(event);
    const i = selected_node(graph.nodes, mouse);
    const j = selected_edge(graph.edges, mouse);
    if (i >= 0 && !mouse_moved()) {
      if (last_clicked_node === -1) {
        last_clicked_node = i;
      } else {
        // New edge
        graph.edges.set(
          new_id(graph.used_edge_ids),
          new_edge(graph.nodes.get(last_clicked_node)!, graph.nodes.get(i)!),
        );
        last_clicked_node = -1;
        // State of the graph has changed so update the instruction string
      }
    } else if (j >= 0 && !mouse_moved()) {
      last_clicked_edge = j;
    } else {
      last_clicked_node = -1;
      last_clicked_edge = -1;
    }
    mouse_down = false;
    node_moving = false;
    edge_moving = false;
    redraw();
  }

  function handle_key_down(event: any) {
    const key_down = event.key;
    if (key_down === "d") {
      console.log(instructions_from_graph(graph));
    }
    if (last_clicked_node >= 0 && edit_node_index < 0) {
      if (key_down === "Backspace") {
        remove_node(graph.nodes, graph.edges, graph.used_node_ids, last_clicked_node);
        // State of the graph has changed so update the instruction string

        console.log("Deleting Node " + last_clicked_node);
        last_clicked_node = -1;
        redraw();
      } else if (key_down === "s") {
        graph.start_node_id = last_clicked_node;

        redraw();
      } else if (key_down === "Enter") {
        graph.nodes.get(last_clicked_node)!.is_accept =
          !graph.nodes.get(last_clicked_node)!.is_accept;

        redraw();
      }
    }
    if (last_clicked_edge >= 0 && key_down === "Backspace" && edit_edge_index < 0) {
      // State of the graph has changed so update the instruction string
      remove_edge(graph.edges, last_clicked_edge);
      redraw();
    }
    let obj: Node | Edge | undefined;
    if (edit_edge_index >= 0) {
      obj = graph.edges.get(edit_edge_index)!;
    } else if (edit_node_index >= 0) {
      obj = graph.nodes.get(edit_node_index)!;
    } else {
      return;
    }
    if (key_down === "Backspace" && obj.label.length > 0) {
      obj.label = obj.label.slice(0, obj.label.length - 1);
      redraw();
    } else if (key_down.length === 1) {
      obj.label = obj.label.concat(key_down);
      redraw();
    }
  }
</script>

<svelte:window
  on:mousedown={handle_mouse_down}
  on:mousemove={handle_mouse_move}
  on:mouseup={handle_mouse_up}
  on:keydown={handle_key_down}
/>

<canvas
  id="graph-canvas"
  bind:this={canvas}
  class="w-full bg-surface0 outline outline-1 outline-overlay2"
/>
