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
  } from "$lib/turing/graph";

  type Coord2d = { x: number; y: number };

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  let mouse = { x: 0, y: 0 };
  let mouse_down_pos = { x: 0, y: 0 };
  let mouse_up_pos = { x: 0, y: 0 };
  let moving = false;
  let circle = { x: 0, y: 0 };
  let radius = 20;

  let mouse_down = false;
  let last_mouse_down: number;

  onMount(() => {
    context = canvas.getContext("2d")!;
    canvasStore.set(canvas);
    contextStore.set(context);
  });

  function in_circle(): boolean {
    return (circle.x - mouse.x) ** 2 + (circle.y - mouse.y) ** 2 <= radius ** 2;
  }

  function redraw() {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 2;
    context.strokeStyle = "#FFFFFF";
    if (mouse_down && in_circle()) {
      context.strokeStyle = "#FF0000";
    }
    context.beginPath();
    context.arc(circle.x, circle.y, radius, 0, 2 * Math.PI, true);
    context.stroke();
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
    const dx = mouse.x - last_x;
    const dy = mouse.y - last_y;
    if (moving) {
      circle.x = circle.x + dx;
      circle.y = circle.y + dy;
      redraw();
    }
  }

  function handle_mouse_down(event: any) {
    handle_mouse_move(event);
    mouse_down = true;
    if (in_circle()) {
      mouse_down_pos.x = mouse.x;
      mouse_down_pos.y = mouse.y;
      moving = true;
    }
    const dt = performance.now() - last_mouse_down;
    if (dt > 0 && dt < 500) {
      circle = { x: mouse.x, y: mouse.y };
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
