<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { page } from "$app/stores";

  const links = [
    { name: "λ-calculus", url: "/lambda" },
    { name: "Turing Machines", url: "/turing" },
    { name: "Automata", url: "/automata" },
  ];
</script>

<div class="flex items-center justify-between text-slate-200">
  <h1 class="font-semibold">
    <a href="/">The Turing Tarpit</a>
  </h1>

  <nav>
    <ul class="flex space-x-3">
      {#each links as { name, url }}
        {#if $page.url.pathname !== url}
          <li><a href={url}>{name}</a></li>
        {:else}
          <li><a href={url} class="text-red-400">{name}</a></li>
        {/if}
      {/each}
    </ul>
  </nav>
</div>
