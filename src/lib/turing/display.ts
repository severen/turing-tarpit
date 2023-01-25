/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  TableReadError,
  tm_step,
  type TM,
  type TM_State,
  type TM_TableReadResult,
} from "./tm";

// Return a formatted string of the given TM.
function tm_string(tm: TM): string {
  let outstring = `Start state: ${tm.start_state}, Accept states: {${Array.from(
    tm.accept_states.values(),
  ).join(",")}}\n`;
  for (const state of tm.delta.keys()) {
    outstring = outstring.concat(
      `${"-".repeat(state.length)}${state}${"-".repeat(state.length)}\n`,
    );
    // At this point the TM has been read correctly so these will exist
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const arcs = tm.delta.get(state)!;
    for (const read of arcs.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const transition = arcs.get(read)!;
      outstring = outstring.concat(
        `  ${read}, ${transition.write}, ${transition.move} -> ${transition.next}\n`,
      );
    }
  }
  return outstring;
}

function tape_string(tape: Array<string>, head: number): string {
  const spaces = Array(tape.length).fill(" ");
  const temp = [...spaces];
  temp[head] = "^";
  return tape.join("") + "\n" + temp.join("");
}

export function tm_read_result_display(
  input: string,
  result: TM_TableReadResult,
): string {
  if (result.error === TableReadError.Ok) {
    return `\nInput Turing Machine\n${"-".repeat(20)}\n` + tm_string(result.tm);
  } else if (result.error === TableReadError.UndefinedState) {
    return (
      "\nRead Turing Machine has undefined state(s)\n" +
      `${"-".repeat(42)}\n` +
      result.msg
    );
  } else {
    let outstring =
      `\n${
        result.error === TableReadError.AmbiguousTransitions
          ? "Read Turing Machine has Non-deterministic transitions"
          : "Read Error"
      }\n` +
      "-".repeat(20) +
      "\n";
    for (const [i, line] of input.split("\n").entries()) {
      if (i === result.linenum) {
        outstring = outstring.concat(line + " <-- " + result.msg + "\n");
      } else {
        outstring = outstring.concat(line + "\n");
      }
    }
    return outstring;
  }
}

export function tm_state_display(tm: TM, in_state: TM_State) {
  if (in_state.state === "ACCEPT" || in_state.state === "REJECT") {
    return (
      tape_string(in_state.tape, in_state.head) +
      `\nState: ${in_state.state}, Read: !, Write: !, Next: !`
    );
  } else {
    const peek = tm_step(tm, in_state);
    let write = "";
    const state_lookup = tm.delta.get(in_state.state);
    if (state_lookup !== undefined) {
      const arc = state_lookup.get(in_state.tape[in_state.head]);
      if (arc !== undefined) {
        write = arc.write;
      } else {
        write = "!";
      }
    } else {
      write = "!";
    }
    return (
      tape_string(in_state.tape, in_state.head) +
      `\nState: ${in_state.state}, Read: ${
        in_state.tape[in_state.head]
      }, Write: ${write}, Next: ${peek.state}`
    );
  }
}
