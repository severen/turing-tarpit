<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  export let title: string | undefined = undefined;
  export let color: "red" | "green" | undefined = undefined;

  let colorClasses: string;
  switch (color) {
    case undefined:
      colorClasses = "bg-surface2";
      break;
    case "red":
      colorClasses = "bg-red text-base";
      break;
    case "green":
      colorClasses = "bg-green text-base";
      break;
  }
</script>

<button
  class="p-2 outline outline-1 outline-overlay2 hover:bg-yellow hover:text-base focus:bg-peach focus:text-base {colorClasses}"
  type="button"
  {title}
  on:click
>
  <slot />
</button>
