<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  export let title: string | undefined = undefined;
  export let values: { name: string; value: unknown }[];
  export let color: "red" | "green" | undefined = undefined;

  export let value: unknown;

  let colorClasses: string;
  switch (color) {
    case undefined:
      colorClasses = "bg-surface0";
      break;
    case "red":
      colorClasses = "bg-red text-base";
      break;
    case "green":
      colorClasses = "bg-green text-base";
      break;
  }

  let i = 0;
  $: value = values[i].value;
</script>

<select
  class="p-2 outline outline-1 outline-overlay2 hover:cursor-pointer hover:bg-yellow hover:text-base focus:bg-peach focus:text-base {colorClasses}"
  {title}
  bind:value={i}
>
  {#each values as { name }, i}
    <option value={i}>{name}</option>
  {/each}
</select>
