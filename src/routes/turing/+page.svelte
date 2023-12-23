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
    tm_step,
    type TM,
    type TM_State,
    extend_tape,
    TAPE_CHUNK_LEN,
  } from "$lib/turing/tm";
  import { tm_read_result_display, tm_state_display } from "$lib/turing/display";
  import GraphCanvas from "$lib/components/GraphCanvas.svelte";
  import { init_tm_graph, instructions_from_graph } from "$lib/turing/graph/logic";

  let document: string;
  let instructions: string;
  let graph = init_tm_graph();

  let tape_input_string = "";
  let tm_display_string = "";
  let tape_display_string = "";
  let successful_read = false;
  let text_input = true;
  let tm: TM;
  let states: Array<TM_State>;
  let display_index = 0;
  const max_steps = 150;

  function initialize() {
    if (!text_input) {
      instructions = instructions;
      document = instructions_from_graph(graph);
      console.log(instructions);
    }
    const result = read_transition_table(document);
    tm_display_string = tm_read_result_display(document, result);
    if (result.error === TableReadError.Ok) {
      tm = result.tm;
      successful_read = true;
      states = [starting_state(tm, tape_input_string)];
      display_index = 0;
      tape_display_string = tm_state_display(tm, states[display_index]);
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
    tape_input_string = "xyxxyx";
  }

  function step_back() {
    if (!successful_read) {
      tape_display_string = "No Turing machine to run!";
    } else if (display_index > 0) {
      display_index--;
      tape_display_string = tm_state_display(tm, states[display_index]);
    }
  }

  function step_forward() {
    if (!successful_read) {
      tape_display_string = "No Turing machine to run!";
    } else if (display_index === states.length - 1) {
      //Extend tape if needed
      if (
        states[display_index].head < 0 ||
        states[display_index].head >= states[display_index].tape.length
      ) {
        states[display_index].tape = extend_tape(
          states[display_index].head,
          states[display_index].tape,
        );
        if (states[display_index].head < 0) {
          states[display_index].head = TAPE_CHUNK_LEN - 1;
        }
      }
      states.push(tm_step(tm, states[display_index]));
      display_index++;
      tape_display_string = tm_state_display(tm, states[display_index]);
    } else {
      display_index++;
      tape_display_string = tm_state_display(tm, states[display_index]);
    }
  }

  function run() {
    if (!successful_read) {
      tape_display_string = "No Turning machine to run!";
    } else {
      let step = 0;
      while (
        states[display_index].state !== "ACCEPT" &&
        states[display_index].state !== "REJECT"
      ) {
        if (step <= max_steps) {
          step_forward();
          step++;
        } else {
          break;
        }
      }
    }
  }

  function switch_input_mode() {
    text_input = !text_input;
  }
</script>

<div>
  {#if text_input}
    <Editor bind:document />
    <br />
  {:else}
    <GraphCanvas bind:graph />
    <br />
  {/if}
</div>

<div>
  <Button on:click={switch_input_mode}>{text_input ? "Graph" : "<-"}</Button>
  <!-- Just loads the binary palindrome tm into the editor string -->
  <Button on:click={read_debug}>Debug</Button>
  <textarea
    class="pd-2 border-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    id="tm-read-output"
    name="tm-read-output"
    rows={!successful_read ? tm_display_string.split("\n").length : 1}
    cols={60}
    readonly={true}
  >
    {successful_read ? "Valid Turing Machine." : tm_display_string}
  </textarea>
</div>

<label for="tm-read-string">Tape Input:</label>
<input
  class="mr-2 border-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
  bind:value={tape_input_string}
  on:change={initialize}
/>

<Button on:click={initialize}>Write to tape</Button>

<Button on:click={initialize}>{"<<"}</Button>

<Button on:click={step_back}>{"<="}</Button>

<Button on:click={step_forward}>{"=>"}</Button>

<Button on:click={run}>{">>"}</Button>

<div>
  <pre class="flex-auto bg-surface0 p-2 outline outline-1 outline-overlay2">
    {"\n" + tape_display_string}
  </pre>
</div>
