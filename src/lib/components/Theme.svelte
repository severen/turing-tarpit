<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { isDarkTheme } from "$lib/stores/theme";

  if (browser) {
    isDarkTheme.subscribe((isDarkTheme) => {
      const classList = document.documentElement.classList;
      if (isDarkTheme) {
        classList.add("dark");
      } else {
        classList.remove("dark");
      }

      return () => {
        classList.remove("dark");
      };
    });
  }
</script>

<!--
  Apply the user's theme preferences as early as possible to avoid a flash
  of unstyled content.
-->
<svelte:head>
  <script>
    isSystem = localStorage.theme === "system" || !("theme" in localStorage);
    prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if ((isSystem && prefersDark) || localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  </script>
</svelte:head>

<div class="latte bg-base text-text antialiased transition dark:macchiato">
  <slot />
</div>
