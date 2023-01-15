<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  export let href: string;
  export let active = false;
</script>

<a
  class:text-peach={active}
  class="transition hover:text-peach focus:ring-2 focus:ring-peach"
  {href}
>
  <slot />
</a>
