<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { applications } from "$lib/applications";
  import Link from "$lib/components/Link.svelte";
</script>

<!-- TODO: Make this prettier. -->
<p>Welcome to the Turing Tarpit!</p>

<br />

<p>Choose your application:</p>
<ul class="ml-4">
  {#each applications as { name, description, url }}
    <li>
      <Link href={url}>
        {name} &mdash; {description}
      </Link>
    </li>
  {/each}
</ul>
