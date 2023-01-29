<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import Select from "$lib/components/Select.svelte";
  import Play from "$lib/components/icons/Play.svelte";
  import { parse } from "$lib/lambda/parser";
  import { evaluate, Strategy } from "$lib/lambda/reducer";
  import { prettyPrint, type Term } from "$lib/lambda/syntax";

  let document = "";
  let t: Term | undefined;

  let strategy: Strategy;
  const strategies = [
    { name: "normal order", value: Strategy.NormalOrder },
    { name: "applicative order", value: Strategy.ApplicativeOrder },
    { name: "call by value", value: Strategy.CallByValue },
    { name: "call by name", value: Strategy.CallByName },
  ];

  function reduceDocument() {
    const ts = evaluate(parse(document));
    t = ts[ts.length - 1];
  }
</script>

<Editor bind:document />

<div class="flex">
  <Select
    title="Evaluation Strategy"
    color="green"
    values={strategies}
    bind:value={strategy}
  />
  <Button title="Evaluate" color="green" on:click={reduceDocument}>
    <Play />
  </Button>

  <div
    class="flex-auto overflow-auto bg-surface0 p-2 outline outline-1 outline-overlay2"
  >
    <pre>{t ? prettyPrint(t) : ""}</pre>
  </div>
</div>
