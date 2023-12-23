<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import ChevronDown from "$lib/components/icons/ChevronDown.svelte";
  import ChevronUp from "$lib/components/icons/ChevronUp.svelte";
  import Play from "$lib/components/icons/Play.svelte";
  import Select from "$lib/components/Select.svelte";
  import { parse } from "$lib/lambda/parser";
  import { evaluate, Strategy } from "$lib/lambda/reducer";
  import { prettyPrint, type Term } from "$lib/lambda/syntax";

  let document = "";
  let ts: Term[] | undefined;
  let displaySteps = false;

  let strategy: Strategy;
  const strategies = [
    { name: "normal order", value: Strategy.NormalOrder },
    { name: "applicative order", value: Strategy.ApplicativeOrder },
    { name: "call by value", value: Strategy.CallByValue },
    { name: "call by name", value: Strategy.CallByName },
  ];

  function reduceDocument() {
    ts = evaluate(parse(document));
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
</div>

<br />

<div class="bg-surface0 outline outline-1 outline-overlay2">
  <div class="flex h-10">
    <div class="flex-grow overflow-x-auto border-b-[1px] border-overlay2 p-2">
      <pre>{ts && !displaySteps ? prettyPrint(ts[ts.length - 1]) : ""}</pre>
    </div>
    <Button on:click={() => (displaySteps = !displaySteps)}>
      {#if !displaySteps}
        <ChevronDown />
      {:else}
        <ChevronUp />
      {/if}
    </Button>
  </div>

  {#if ts && displaySteps}
    <ol class="grid overflow-x-auto">
      {#each ts as t, i}
        <li class="h-10 w-full border-b-[1px] border-overlay2 p-2">
          <pre>{i}. {prettyPrint(t)}</pre>
        </li>
      {/each}
    </ol>
  {/if}
</div>
