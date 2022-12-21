/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getContext, onMount, onDestroy } from 'svelte';
import { writable, derived } from 'svelte/store';

export const width = 732;
export const height = 172;
export const context = writable();
export const canvas = writable();

