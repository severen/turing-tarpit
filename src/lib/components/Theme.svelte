<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { onMount } from "svelte";

  import { theme, Theme } from "$lib/stores/theme";

  onMount(() => {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    matcher.addEventListener("change", handleChange);

    const unsubscribe = theme.subscribe((newTheme) => {
      if (newTheme !== Theme.System) {
        setDark(newTheme === Theme.Dark);
      }
    });

    return () => {
      unsubscribe();
      matcher.removeEventListener("change", handleChange);
    };
  });

  function handleChange({ matches: dark }: MediaQueryListEvent) {
    if ($theme === Theme.System) {
      setDark(dark);
    }
  }

  function setDark(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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

<div class="bg-white antialiased dark:bg-slate-900 dark:text-slate-500">
  <slot />
</div>
