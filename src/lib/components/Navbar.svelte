<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { page } from "$app/stores";

  import { applications } from "$lib/applications";
  import Link from "$lib/components/Link.svelte";
  import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";

  import logo from "$lib/assets/logo.svg";
</script>

<div class="flex items-center justify-between">
  <a href="/">
    <img src={logo} alt="The Turing Tarpit" class="h-10 md:h-20" />
  </a>

  <nav>
    <ul class="flex space-x-3">
      {#each applications as { name, url }}
        {#if $page.url.pathname !== url}
          <li><Link href={url}>{name}</Link></li>
        {:else}
          <li><Link active href={url}>{name}</Link></li>
        {/if}
      {/each}
    </ul>
  </nav>

  <ThemeSwitcher />
</div>
