<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import { parse } from "$lib/lambda/parser";

  let document: string;

  function parseDocument() {
    const term = parse(document);
    // TODO: Replace this with a parse tree view on the page.
    console.log(term);
  }
</script>

<Editor bind:document />

<br />

<button
  type="button"
  class="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
  on:click={parseDocument}
>
  Parse
</button>
