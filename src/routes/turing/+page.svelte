<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import {
    starting_state,
    read_transition_table,
    TableReadError,
    tape_string,
    tm_read_result_display,
    tm_step,
    type TM,
    type TM_State,
  } from "$lib/turing/tm";
  //import type { TM_TableReadResult } from "$lib/turing/tm";

  let document: string;
  let tm_display_string = "";
  let tape_display_string = "";
  let successful_read = false;
  let tm: TM;
  let states: Array<TM_State>;
  let display_index = 0;

  function read_document() {
    const result = read_transition_table(document);
    tm_display_string = tm_read_result_display(document, result);
    if (result.error === TableReadError.Ok) {
      tm = result.tm;
      successful_read = true;
      states = [starting_state(tm, "aabbab")];
      tape_display_string =
        tape_string(states[display_index].tape, states[display_index].head) +
        `\nState: ${states[display_index].state}`;
    } else {
      successful_read = false;
      tape_display_string = "";
    }
  }

  function step_back() {
    if (!successful_read) {
      tape_display_string = "No Turing machine to run!";
    } else if (display_index > 0) {
      display_index--;
      tape_display_string =
        tape_string(states[display_index].tape, states[display_index].head) +
        `\nState: ${states[display_index].state}`;
    }
  }

  function step_forward() {
    if (!successful_read) {
      tape_display_string = "No Turing machine to run!";
    } else if (display_index === states.length - 1) {
      states.push(
        tm_step(
          tm,
          states[display_index].state,
          states[display_index].tape,
          states[display_index].head,
        ),
      );
      display_index++;
      tape_display_string =
        tape_string(states[display_index].tape, states[display_index].head) +
        `\nState: ${states[display_index].state}`;
    } else {
      display_index++;
      tape_display_string =
        tape_string(states[display_index].tape, states[display_index].head) +
        `\nState: ${states[display_index].state}`;
    }
  }
</script>

<div>
  <Editor bind:document />

  <br />

  <button
    type="button"
    class="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
    on:click={read_document}
  >
    Read
  </button>
  <label for="tm-read-output">Read Instructions:</label>
</div>

<div>
  <textarea
    class="mr-2 mb-2 border-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    id="tm-read-output"
    name="tm-read-output"
    rows={10}
    cols={70}
    readonly={true}
    wrap="soft"
  >
    {tm_display_string}
  </textarea>
</div>
<button
  type="button"
  class="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
  on:click={step_back}
>
  Step Back
</button>
<button
  type="button"
  class="mr-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
  on:click={step_forward}
>
  Step Forward
</button>

<div>
  <textarea
    class="mr-2 mb-2 border-2 font-mono text-sm  dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    id="tm-tape"
    name="tm-tape"
    rows={5}
    cols={70}
    readonly={true}
    wrap="soft"
  >
    {"\n" + tape_display_string}
  </textarea>
</div>
