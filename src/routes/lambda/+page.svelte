<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import { parse } from "$lib/lambda/parser";
  import { reduce, step } from "$lib/lambda/reducer";
  import { debugPrint, prettyPrint, type Term } from "$lib/lambda/syntax";

  let document: string;
  let t: Term;

  function parseDocument() {
    t = parse(document);
    // TODO: Replace this with a parse tree view on the page.
    console.log("parsed:", debugPrint(t));
    console.log("pretty:", prettyPrint(t));
  }

  function reduceTerm() {
    console.log("reduced:", debugPrint(reduce(t)));
    console.log("reduced pretty:", prettyPrint(reduce(t)));
  }

  function stepTerm() {
    console.log("reduced:", debugPrint(step(t)));
  }
</script>

<Editor bind:document />

<br />

<Button on:click={parseDocument}>Parse</Button>
<Button on:click={reduceTerm}>Reduce</Button>
<Button on:click={stepTerm}>Step</Button>
