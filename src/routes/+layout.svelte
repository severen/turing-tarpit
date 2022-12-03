<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import "../main.css";

  import Navbar from "$lib/components/Navbar.svelte";
</script>

<!-- TODO: Adjust the title and description for each page. -->
<svelte:head>
  <title>The Turing Tarpit</title>
  <meta
    name="description"
    content="Experiment with the λ-calculus, Turing machines, and automata."
  />
</svelte:head>

<div class="min-h-screen bg-white antialiased dark:bg-slate-900 dark:text-slate-500">
  <div class="mx-auto max-w-screen-md p-4">
    <header class="mb-4">
      <Navbar />
    </header>

    <main>
      <slot />
    </main>
  </div>
</div>
