<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { page } from "$app/stores";

  import { applications } from "$lib/stores/applications";

  import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";
</script>

<div class="flex items-center justify-between dark:text-slate-200">
  <h1 class="font-semibold">
    <a href="/">The Turing Tarpit</a>
  </h1>

  <nav>
    <ul class="flex space-x-3">
      {#each $applications as { name, url }}
        {#if $page.url.pathname !== url}
          <li><a href={url}>{name}</a></li>
        {:else}
          <li><a href={url} class="text-red-600 dark:text-red-300">{name}</a></li>
        {/if}
      {/each}
    </ul>
  </nav>

  <ThemeSwitcher />
</div>
