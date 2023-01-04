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
    type Vec2d
  } from "$lib/turing/graph";



  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  let mouse = { x: 0, y: 0 };
  let mouse_down_pos = { x: 0, y: 0 };
  let moving = false;
  let node_radius = 20;

  let mouse_down = false;
  let last_mouse_down: number;
  let moving_node_index: number;

  let edit_index: number;


  let nodes: Array<Node> = [];

  onMount(() => {
    context = canvas.getContext("2d")!;
    canvasStore.set(canvas);
    contextStore.set(context);
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
      if (mouse_down && in_circle(node.pos, node_radius, mouse) || i === edit_index) {
        context.strokeStyle = "#727272";
      } else {
        context.strokeStyle = "#FFFFFF";
      }
      context.beginPath();
      context.arc(node.pos.x, node.pos.y, node_radius, 0, 2 * Math.PI, true);
      context.closePath();
      context.stroke();
    }

  }


  function double_click(): boolean {
    const dt = performance.now() - last_mouse_down;
    return dt > 0 && dt < 250
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
    handle_mouse_move(event);
    mouse_down = true;
    const selected_index = selected_node(nodes, mouse);
    // User is moving a node around
    if (selected_index >= 0) {
      mouse_down_pos.x = mouse.x;
      mouse_down_pos.y = mouse.y;
      moving = true;
      moving_node_index = selected_index;
    }
    if (double_click()) {
      if (selected_index >= 0) {
        edit_index = selected_index;
      } else {
        nodes.push(new_node({x: mouse.x, y: mouse.y}));
        edit_index = nodes.length - 1;
      }
    } else {
      edit_index = -1;
    }

    last_mouse_down = performance.now();
    redraw();
  }

  function handle_mouse_up(event: any) {
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
