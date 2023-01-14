<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import { parse } from "$lib/lambda/parser";
  import { evaluate } from "$lib/lambda/reducer";
  import { prettyPrint } from "$lib/lambda/syntax";

  let document: string;

  function reduceDocument() {
    const ts = evaluate(parse(document));
    for (const t of ts) {
      console.log(prettyPrint(t));
    }
  }
</script>

<Editor bind:document />

<br />

<Button on:click={reduceDocument}>Evaluate</Button>
