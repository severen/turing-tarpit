/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Turing Machine struct
// delta is a transition function mapping states to maps mapping tape symbols to transition arcs
export type TM = {
  start_state: string;
  accept_states: Set<string>;
  delta: Map<string, Map<string, TM_Arc>>;
};

// Enum defining errors that can occur when reading a transition table for a TM
export enum TableReadError {
  Ok,
  InsufficientItems,
  UnexpectedSymbol,
  UndefinedState,
  AmbiguousTransitions,
}
// Struct for describing the result of reading a transition table. Contains the resulting delta function,
// an error code describing the errors (if any) that occurred when reading, a message with information
// about the error and the line number where the error occurred.
export type TM_TableReadResult = {
  tm: TM;
  error: TableReadError;
  msg: string;
  linenum: number;
};
// Struct for defining transitions in a TM
type TM_Arc = { write: string; move: string; next: string };
// Struct for specifying a step in a TM's execution
type TM_Update = { next_state: string; head_move: number };
/** Struct for defining the result of TM's execution.
 *   - accept field is 'ACCEPT' or 'REJECT' based on whether the input was accepted by the TM
 *   - on_tape is a string of symbols that are left on the tape after the TM has halted
 */
type TM_Result = { accept: string; on_tape: string };
// Return and new transition with the given fields
const new_arc = (write: string, move: string, next: string): TM_Arc => ({
  write,
  move,
  next,
});

const BLANK = "_";
const TAPE_CHUNK_LEN = 10;
const REJECT = "REJECT";
const ACCEPT = "ACCEPT";

function check_delta(
  delta: Map<string, Map<string, TM_Arc>>,
  accept_states: Set<string>,
): string {
  for (const state of delta.keys()) {
    const arcs = delta.get(state)!;
    for (const read_symbol of arcs.keys()) {
      const arc = arcs.get(read_symbol)!;
      if (!delta.has(arc.next) && !accept_states.has(arc.next)) {
        return `Transition from state ${state} leads to undefined state ${arc.next}.`;
      }
    }
  }
  return "";
}

function check_transition(line: string): TableReadError {
  const items = line.split(" ");
  if (items.length !== 5) {
    return TableReadError.InsufficientItems;
  }
  if (items[3] !== "L" && items[3] !== "R") {
    return TableReadError.UnexpectedSymbol;
  }
  return TableReadError.Ok;
}

/** Returns a new TM object from a transition table of the form
 *     StartState AcceptState1 AcceptState2 ...
 *     State ReadSymbol WriteSymbol HeadMove NextState
 *     ...
 *   Throws errors when:
 *     - The table as a line (excluding the header) without 5 items.
 *     - The HeadMove field in a transition is not "L" or "R".
 *     - The table contains multiple transitions for a state for the same tape symbol.
 *     - The table contains a transition with NextState that does not appear elsewhere
 *       in the table.
 */

export function read_transition_table(table: string): TM_TableReadResult {
  const header = table.split("\n")[0];
  const start_state = header.split(" ")[0];
  const accept_states = new Set(header.split(" ").slice(1));
  const delta = new Map();
  const lines = table.split("\n").slice(1).entries();
  for (const [linenum, line] of lines) {
    const trimline = line.trimStart();
    const line_error = check_transition(trimline);
    if (line_error === TableReadError.InsufficientItems) {
      return {
        tm: { start_state, accept_states, delta },
        error: line_error,
        msg: "Lines must have 5 items",
        linenum,
      };
    }
    if (line_error === TableReadError.UnexpectedSymbol) {
      return {
        tm: { start_state, accept_states, delta },
        error: line_error,
        msg: "Move symbol must be L or R",
        linenum,
      };
    }
    const [state, read, write, move, next] = trimline.split(" ");
    if (delta.has(state)) {
      if (delta.get(state).has(read)) {
        return {
          tm: { start_state, accept_states, delta },
          error: TableReadError.AmbiguousTransitions,
          msg: `State ${state} already has a transition for tape symbol ${read}`,
          linenum,
        };
      }
      delta.get(state).set(read, new_arc(write, move, next));
    } else {
      const reads = new Map();
      reads.set(read, new_arc(write, move, next));
      delta.set(state, reads);
    }
  }
  const delta_error = check_delta(delta, accept_states);
  if (delta_error !== "") {
    return {
      tm: { start_state, accept_states, delta },
      error: TableReadError.UndefinedState,
      msg: delta_error,
      linenum: lines.length + 1,
    };
  }
  return {
    tm: { start_state, accept_states, delta },
    error: TableReadError.Ok,
    msg: "Ok",
    linenum: lines.length + 1,
  };
}

export function tm_string(tm: TM): string {
  let outstring = `Start state: ${tm.start_state}, Accept states: {${Array.from(
    tm.accept_states.values(),
  ).join(",")}}\n`;
  for (const state of tm.delta.keys()) {
    outstring = outstring.concat(
      `  ${"-".repeat(state.length)}${state}${"-".repeat(state.length)}\n`,
    );
    const arcs = tm.delta.get(state)!;
    for (const read of arcs.keys()) {
      const transition = arcs.get(read)!;
      outstring = outstring.concat(
        `    ${read}, ${transition.write}, ${transition.move} -> ${transition.next}\n`,
      );
    }
  }
  return outstring;
}

export function tm_read_result_display(result: TM_TableReadResult): string {
  if (result.error === TableReadError.Ok) {
    return tm_string(result.tm);
  } else if (result.error === TableReadError.AmbiguousTransitions) {
    return tm_string(result.tm).concat(`\n ${result.msg}`);
  }
}

function init_tape(input: string): Array<string> {
  let tape_length = TAPE_CHUNK_LEN;
  while (tape_length - input.length < 2 * TAPE_CHUNK_LEN) {
    tape_length += TAPE_CHUNK_LEN;
  }
  return Array(tape_length).fill(BLANK);
}

function extend_tape(head: number, tape: Array<string>): Array<string> {
  if (head < 0) {
    //head has fallen off the left of the tape, so the head is now at the right end of the new chunk.
    return Array(TAPE_CHUNK_LEN).fill(BLANK).concat(tape);
  }
  //head has fallen off the right of the tape, just append a new chunk.
  return tape.concat(Array(TAPE_CHUNK_LEN).fill(BLANK));
}

function should_trim(slot: string, i: number, tape: Array<string>): boolean {
  if (slot !== BLANK) {
    return false;
  }
  if (i > 0 && i < tape.length && tape[i - 1] !== BLANK && tape[i + 1] !== BLANK) {
    return false;
  }
  return true;
}

export function tape_string(tape: Array<string>, head: number): string {
  const spaces = Array(tape.length).fill(" ");
  const temp = [...spaces];
  temp[head] = "^";
  return tape.join("") + "\n" + temp.join("");
}

/** Returns a (new_state, head_move) pair resulting from one step of the TM excitation on the given tape.
 *   Also updates the tape appropriately in place. If the TM reads a symbol off the tape that does not
 *   have an associated transition from the current state the next_state will be REJECT.
 */
export function tm_step(
  tm: TM,
  state: string,
  tape: Array<string>,
  head: number,
): TM_Update {
  const state_lookup = tm.delta.get(state)!; // delta.get(state) is guaranteed to exist as it is checked in check_delta.
  const transition = state_lookup.get(tape[head]);
  if (transition === undefined) {
    return { next_state: REJECT, head_move: 0 };
  }
  tape[head] = transition!.write;
  return {
    next_state: transition!.next,
    head_move: transition!.move === "R" ? 1 : -1,
  };
}

// Return A TM_Result object resulting from executing the given TM on the given input string.
export function tm_execute(tm: TM, input: string): TM_Result {
  let tape = init_tape(input);
  //Copy input to tape
  for (let i = 0; i < input.length; i++) {
    tape[TAPE_CHUNK_LEN + i] = input[i];
  }
  let head = TAPE_CHUNK_LEN;
  let state = tm.start_state;
  while (!tm.accept_states.has(state) && state !== REJECT) {
    //Get new TM state
    const update = tm_step(tm, state, tape, head);
    state = update.next_state;
    head += update.head_move;
    //Extend tape if needed
    if (head < 0 || head >= tape.length) {
      tape = extend_tape(head, tape);
      if (head < 0) {
        head = TAPE_CHUNK_LEN - 1;
      }
    }
  }
  return {
    accept: tm.accept_states.has(state) ? ACCEPT : REJECT,
    on_tape: tape.filter((slot, i, t) => !should_trim(slot, i, t)).join(""),
  };
}
