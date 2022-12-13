<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import Editor from "$lib/components/Editor.svelte";
  import Button from "$lib/components/Button.svelte";

  import {
    starting_state,
    read_transition_table,
    TableReadError,
    tm_state_display,
    tm_read_result_display,
    tm_step,
    type TM,
    type TM_State,
  } from "$lib/turing/tm";

  let document: string;
  let tape_input_string = "";
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
      states = [starting_state(tm, tape_input_string)];
      display_index = 0;
      tape_display_string = tm_state_display(states[display_index]);
    } else {
      successful_read = false;
      tape_display_string = "";
    }
  }

  function read_debug() {
    const tm_str = `q0 q6
                    q0 x _ R q1
                    q0 _ _ R q6
                    q1 x x R q1
                    q1 y y R q1
                    q1 _ _ L q2
                    q2 x _ L q3
                    q3 x x L q3
                    q3 y y L q3
                    q3 _ _ R q0
                    q0 y _ R q4
                    q4 x x R q4
                    q4 y y R q4
                    q4 _ _ L q5
                    q5 y _ L q3`;
    document = tm_str;
  }

  function step_back() {
    if (!successful_read) {
      tape_display_string = "No Turing machine to run!";
    } else if (display_index > 0) {
      display_index--;
      tape_display_string = tm_state_display(states[display_index]);
    }
  }

  function step_forward() {
    if (!successful_read) {
      tape_display_string = "No Turing machine to run!";
    } else if (display_index === states.length - 1) {
      states.push(tm_step(tm, states[display_index]));
      display_index++;
      tape_display_string = tm_state_display(states[display_index]);
    } else {
      display_index++;
      tape_display_string = tm_state_display(states[display_index]);
    }
  }
</script>

<div>
  <Editor bind:document />

  <br />

  <Button on:click={read_document}>Read</Button>
  <!-- Just loads the binary palindrome tm into the editor string -->
  <label for="tm-read-output">Read Instructions:</label>
  <Button on:click={read_debug}>Debug</Button>
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

<label for="tm-read-string">Tape Input:</label>
<input
  class="mr-2 border-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
  rows={1}
  cols={15}
  bind:value={tape_input_string}
  on:change={read_document}
/>

<Button on:click={step_back}>Step Back</Button>

<Button on:click={step_forward}>Step Forward</Button>

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
