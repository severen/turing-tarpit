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
    draw_edge
  } from "$lib/turing/graph";



  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  let mouse = { x: 0, y: 0 };
  let last_mouse = {x: 0, y: 0};
  let mouse_down_pos = { x: 0, y: 0 };
  let moving = false;
  let node_radius = 20;

  let mouse_down = false;
  let last_mouse_down: number;
  let moving_node_index: number;

  let edit_index = -1;
  let last_clicked_node = -1;


  let nodes: Array<Node> = [];
  let edges: Array<Edge> = [];

  onMount(() => {
    context = canvas.getContext("2d")!;
    canvasStore.set(canvas);
    contextStore.set(context);
    context.font = "10px serif";
  });

  function in_circle(center: Vec2d, radius: number, mouse: Vec2d): boolean {
    return (center.x - mouse.x) ** 2 + (center.y - mouse.y) ** 2 <= radius ** 2;
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
    for (const edge of edges) {
      draw_edge(context, edge, node_radius);
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
    if (moving) {
      const dx = mouse.x - last_x;
      const dy = mouse.y - last_y;
      nodes[moving_node_index].pos.x += dx;
      nodes[moving_node_index].pos.y += dy;
      redraw();
    }
    if (mouse_down) {
      redraw();
    }
  }

  function handle_mouse_down(event: any) {
    mouse_down = true;
    const selected_index = selected_node(nodes, mouse);
    // Move node with mouse
    if (selected_index >= 0) {
      mouse_down_pos.x = mouse.x;
      mouse_down_pos.y = mouse.y;
      moving = true;
      moving_node_index = selected_index;
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;
    }
    handle_mouse_move(event);
    if (double_click()) {
      if (selected_index >= 0) { // Edit node label
        edit_index = selected_index;
      } else { // Create a new node
        nodes.push(new_node({x: mouse.x, y: mouse.y}));
        edit_index = -1;
        last_clicked_node = -1;
      }
    }
    else { // Unselect node
      edit_index = -1;
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
    moving = false;
    redraw();
  }
</script>

<svelte:window
  on:mousedown={handle_mouse_down}
  on:mousemove={handle_mouse_move}
  on:mouseup={handle_mouse_up}
/>

<canvas
  id="graph-canvas"
  bind:this={canvas}
  {width}
  {height}
  class="mr-2 border-2  dark:border-gray-300 dark:bg-gray-800 dark:text-white"
/>
