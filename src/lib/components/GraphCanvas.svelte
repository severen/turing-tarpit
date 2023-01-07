<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { onMount, onDestroy, setContext } from "svelte";
  import {
    width,
    height,
    canvas as canvasStore,
    context as contextStore,
    draw_edge,
    edge_label_bounding_box,
    draw_node
  } from "$lib/turing/graph/drawing";
  import { in_circle, in_rect, new_node, type Node, type Edge, type Vec2d, new_edge } from "$lib/turing/graph/logic";

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

  let key_down: string;

  let nodes: Array<Node> = [];
  let edges: Array<Edge> = [];
  let num_nodes = 0;

  onMount(() => {
    context = canvas.getContext("2d")!;
    canvasStore.set(canvas);
    contextStore.set(context);
    context.font = "15px mono";
  });

  // Return the index of the node the mouse is in, otherwise return -1
  function selected_node(nodes: Array<Node>, mouse: Vec2d): number {
    for (const [i, node] of nodes.entries()) {
      if (in_circle(node.pos, node_radius, mouse)) {
        return i;
      }
    }
    return -1;
  }

  // Return the index of the edge the mouse is in the label in, otherwise return -1
  function selected_edge(edges: Array<Edge>, mouse: Vec2d): number {
    for (const [i, edge] of edges.entries()) {
      const edge_box = edge_label_bounding_box(context, edge);
      if (in_rect(edge_box.top_left, edge_box.width, edge_box.height, mouse)) {
        return i;
      }
    }
    return -1;
  }

  function redraw() {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 2;

    //Draw edges
    for (const [i, edge] of edges.entries()) {
      draw_edge(context, edge, node_radius, i === edit_edge_index);
    }

    //Draw nodes
    for (const [i, node] of nodes.entries()) {
      draw_node(
        context,
        node,
        node_radius,
        i === edit_node_index,
        i === last_clicked_node,
      );
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
    if (node_moving) {
      const dx = mouse.x - last_x;
      const dy = mouse.y - last_y;
      nodes[moving_node_index].pos.x += dx;
      nodes[moving_node_index].pos.y += dy;
    }
    if (edge_moving) {
      const dy = mouse.y - last_y;
      edges[moving_edge_index].h += dy;
    }

    if (mouse_down) {
      redraw();
    }
  }

  function handle_mouse_down(event: any) {
    mouse_down = true;
    const selected_node_index = selected_node(nodes, mouse);
    const selected_edge_index = selected_edge(edges, mouse);

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
    }

    handle_mouse_move(event);
    if (double_click()) {
      if (selected_node_index >= 0) {
        // Edit node label
        edit_node_index = selected_node_index;
        edit_edge_index = -1;
      } else if (selected_edge_index >= 0) {
        edit_edge_index = selected_edge_index;
        edit_node_index = -1;
      } else {
        // Create a new node
        nodes.push(new_node({ x: mouse.x, y: mouse.y }));
        nodes[nodes.length - 1].label = `q${num_nodes}`
        num_nodes += 1;
        edit_node_index = -1;
        last_clicked_node = -1;
        edit_edge_index = -1;
      }
    } else {
      // Unselect nodes and edges
      edit_node_index = -1;
      edit_edge_index = -1;
    }
    last_mouse_down = performance.now();
    redraw();
  }

  function handle_mouse_up(event: any) {
    handle_mouse_move(event);
    const i = selected_node(nodes, mouse);
    if (i >= 0 && !mouse_moved()) {
      if (last_clicked_node === -1) {
        last_clicked_node = i;
      } else {
        edges.push(new_edge(nodes[last_clicked_node], nodes[i]));
        last_clicked_node = -1;
      }
    } else {
      last_clicked_node = -1;
    }
    mouse_down = false;
    node_moving = false;
    edge_moving = false;
    redraw();
  }

  function handle_key_down(event: any) {
    key_down = event.key;
    let obj: Node | Edge | undefined;
    if (edit_edge_index >= 0) {
      obj = edges[edit_edge_index];
    } else if (edit_node_index >= 0) {
      obj = nodes[edit_node_index];
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
  {width}
  {height}
  class="mr-2 border-2  dark:border-gray-300 dark:bg-gray-800 dark:text-white"
/>
