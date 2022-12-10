<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import { read_transition_table, tm_string } from "$lib/turing/tm";
  //import type { TM_TableReadResult } from "$lib/turing/tm";

  let document: string;
  let tm_display_string = "";

  function read_document() {
    const result = read_transition_table(document);
    tm_display_string = tm_string(result.tm);
  }
</script>

<div>
  <Editor bind:document />

  <br />

  <button
    type="button"
    class="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
    on:click={read_document}
  >
    Read
  </button>
  <label for="tm-read-output">Read Instructions:</label>
</div>

<div>
  <textarea
    class="mr-2 mb-2 border-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    id="tm-read-output"
    name="tm-read-output"
    rows={10}
    cols={50}
    readonly={true}
    wrap="soft"
  >
    {tm_display_string}
  </textarea>
</div>
<textarea
  class="mr-2 mb-2 border-2 font-mono text-sm  dark:border-gray-600 dark:bg-gray-800 dark:text-white"
  id="tm-tape"
  name="tm-tape"
  rows={3}
  cols={50}
  readonly={true}
  wrap="soft"
>
  {tm_display_string}
</textarea>
