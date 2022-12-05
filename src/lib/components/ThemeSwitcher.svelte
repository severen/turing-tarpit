<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { theme, Theme } from "$lib/stores/theme";

  import Computer from "$lib/components/icons/Computer.svelte";
  import Sun from "$lib/components/icons/Sun.svelte";
  import Moon from "$lib/components/icons/Moon.svelte";

  function cycleTheme(): void {
    // TODO: Present the user with a more descriptive selection box (such as on
    //       the Tailwind website) instead of cycling through the themes.
    switch ($theme) {
      case Theme.System:
        $theme = Theme.Light;
        break;
      case Theme.Light:
        $theme = Theme.Dark;
        break;
      case Theme.Dark:
        $theme = Theme.System;
        break;
    }
  }
</script>

<!--
  TODO: Fix the system theme icon flashing before the icon for the user's
        preference.
-->
<button type="button" title="Cycle Theme" on:click={cycleTheme}>
  {#if $theme === Theme.System}
    <Computer />
  {:else if $theme === Theme.Light}
    <Sun />
  {:else if $theme === Theme.Dark}
    <Moon />
  {/if}
</button>
