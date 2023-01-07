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
    type Node,
    new_node,
    type Vec2d,
    type Edge,
    new_edge,
    draw_edge,
    edge_label_bounding_box
  } from "$lib/turing/graph";



  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  let mouse = { x: 0, y: 0 };
  let last_mouse = {x: 0, y: 0};
  let mouse_down_pos = { x: 0, y: 0 };
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
  let key_code: string;


  let nodes: Array<Node> = [];
  let edges: Array<Edge> = [];

  onMount(() => {
    context = canvas.getContext("2d")!;
    canvasStore.set(canvas);
    contextStore.set(context);
    context.font = "15px mono";
  });

  function in_circle(center: Vec2d, radius: number, mouse: Vec2d): boolean {
    return (center.x - mouse.x) ** 2 + (center.y - mouse.y) ** 2 <= radius ** 2;
  }

  function in_rect(top_left: Vec2d, w: number, h: number, mouse: Vec2d): boolean {
    return mouse.x >= top_left.x && mouse.x <= top_left.x + w && mouse.y >= top_left.y && mouse.y <= top_left.y + h;
  }

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

    //Draw nodes
    for (const [i, node] of nodes.entries()) {
      if (i === last_clicked_node) {
        context.strokeStyle = "#727272";
      } else {
        context.strokeStyle = "#FFFFFF";
      }
      context.beginPath();
      context.arc(node.pos.x, node.pos.y, node_radius, 0, 2 * Math.PI, true);
      context.closePath();
      context.stroke();
      context.fillText(node.label, node.pos.x, node.pos.y)
    }
    for (const [i, edge] of edges.entries()) {
      draw_edge(context, edge, node_radius, i === edit_edge_index);
    }

  }


  function double_click(): boolean {
    const dt = performance.now() - last_mouse_down;
    return dt > 0 && dt < 250
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
      if (selected_node_index >= 0) { // Edit node label
        edit_node_index = selected_node_index;
      } else if (selected_edge_index >= 0) {
        edit_edge_index = selected_edge_index;
      } else { // Create a new node
        nodes.push(new_node({x: mouse.x, y: mouse.y}));
        edit_node_index = -1;
        last_clicked_node = -1;
      }
    }
    else { // Unselect nodes and edges
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
    key_code = event.code;
    if (edit_edge_index >= 0) {
      if (key_down === "Backspace" && edges[edit_edge_index].label.length > 0) {
        edges[edit_edge_index].label = edges[edit_edge_index].label.slice(0, edges[edit_edge_index].label.length - 1);
        redraw();
      } else if (key_down.length === 1) {
        edges[edit_edge_index].label = edges[edit_edge_index].label.concat(key_down);
        redraw();
      }
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
