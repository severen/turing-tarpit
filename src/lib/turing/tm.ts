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

/**  Enum defining errors that can occur when reading a transition table for a TM these include
 *     - The table as a line (excluding the header) without 5 items (InsufficientItems).
 *     - The HeadMove field in a transition is not "L" or "R" (UnexpectedSymbol).
 *     - The table contains multiple transitions for a state for the same tape symbol (UndefinedState).
 *     - The table contains a transition with NextState that does not appear elsewhere
 *       in the table (AmbiguousTransitions).
 */
export enum TableReadError {
  Ok,
  InsufficientItems,
  UnexpectedSymbol,
  BadWriteSymbol,
  BadReadSymbol,
  UndefinedState,
  AmbiguousTransitions,
}

// Struct for describing the result of reading a transition table. Contains the resulting TM,
// an error code describing the errors (if any) that occurred when reading, a message with information
// about the error and the line number where the error occurred.
export type TM_TableReadResult = {
  tm: TM;
  error: TableReadError;
  msg: string;
  linenum: number;
};

//Regex for matching read and write strings
const read_pat = new RegExp(String.raw`^[0-z](\|[0-z])*$`);
const write_pat = new RegExp("^[0-z]$");

// Struct for defining transitions in a TM
type TM_Arc = { write: string; move: string; next: string };

/** Struct for defining the result of TM's execution.
 *   - accept field is 'ACCEPT' or 'REJECT' based on whether the input was accepted by the TM
 *   - on_tape is a string of symbols that are left on the tape after the TM has halted
 *   - ONLY used for testing
 */
type TM_Result = { accept: string; on_tape: string };

// Return and new transition with the given fields
const new_arc = (write: string, move: string, next: string): TM_Arc => ({
  write,
  move,
  next,
});

// Struct that defines a "state" of a TM's execution. Essentially a "snapshot" at some point during the execution.
export type TM_State = {
  state: string;
  head: number;
  tape: Array<string>;
};

const BLANK = "_";
const TAPE_CHUNK_LEN = 10;
const REJECT = "REJECT";
const ACCEPT = "ACCEPT";

function check_delta(
  delta: Map<string, Map<string, TM_Arc>>,
  accept_states: Set<string>,
): string {
  for (const state of delta.keys()) {
    // At this point the TM has been read correctly so these will exist
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const arcs = delta.get(state)!;
    for (const read_symbol of arcs.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  if (!read_pat.test(items[1])) {
    return TableReadError.BadReadSymbol;
  }
  if (!write_pat.test(items[2])) {
    return TableReadError.BadWriteSymbol;
  }
  if (items[3] !== "L" && items[3] !== "R") {
    return TableReadError.UnexpectedSymbol;
  }
  return TableReadError.Ok;
}



function process_line_error(line_error: TableReadError, linenum: number, start_state: string, accept_states: Set<string>, delta: Map<string, Map<string, TM_Arc>>): TM_TableReadResult {
  switch (line_error) {
    case TableReadError.InsufficientItems:
      return {
        tm: { start_state, accept_states, delta },
        error: line_error,
        msg: "Lines must have 5 items",
        linenum,
      };
    case TableReadError.UnexpectedSymbol:
      return {
        tm: { start_state, accept_states, delta },
        error: line_error,
        msg: "Move Symbol must be L or R",
        linenum,
      };
    case TableReadError.BadReadSymbol:
      return {
        tm: {start_state, accept_states, delta},
        error: line_error,
        msg: "Read instruction must be a|b|c etc.",
        linenum
      }
    case TableReadError.BadWriteSymbol:
      return {
        tm: {start_state, accept_states, delta},
        error: line_error,
        msg: "Write instruction must be a single symbol",
        linenum
      }
  }
}

/** Returns a new TM_TableReadResult from a transition table of the form
 *     StartState AcceptState1 AcceptState2 ...
 *     State ReadSymbol WriteSymbol HeadMove NextState
 *     ...
 */
export function read_transition_table(table: string): TM_TableReadResult {
  const header = table.split("\n")[0];
  const start_state = header.split(" ")[0];
  const accept_states = new Set(header.split(" ").slice(1));
  const delta = new Map();
  const lines = Array.from(table.split("\n").entries());
  //Read in all instructions
  for (const [linenum, line] of lines) {
    if (linenum > 0 && line !== "") {
      const trimline = line.trimStart();
      const line_error = check_transition(trimline);
      if (line_error !== TableReadError.Ok) {
        return process_line_error(line_error, linenum, start_state, accept_states, delta);
      }
      const [state, reads, write, move, next] = trimline.split(" ");
      for (const read of reads.split("|")) {
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
    }
  }
  //Check for undefined states
  const delta_error = check_delta(delta, accept_states);
  if (delta_error !== "") {
    return {
      tm: { start_state, accept_states, delta },
      error: TableReadError.UndefinedState,
      msg: delta_error,
      linenum: 0,
    };
  }
  //Ok
  return {
    tm: { start_state, accept_states, delta },
    error: TableReadError.Ok,
    msg: "Ok",
    linenum: 0,
  };
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

export function tm_step(tm: TM, curr_state: TM_State): TM_State {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const state_lookup = tm.delta.get(curr_state.state)!; // delta.get(state) is guaranteed to exist as it is checked in check_delta.
  const transition = state_lookup.get(curr_state.tape[curr_state.head]);
  if (transition === undefined) {
    return { state: REJECT, head: curr_state.head, tape: curr_state.tape };
  }
  const temp = [...curr_state.tape];
  temp[curr_state.head] = transition.write;
  return {
    state: tm.accept_states.has(transition.next) ? ACCEPT : transition.next,
    head: curr_state.head + (transition.move === "R" ? 1 : -1),
    tape: temp,
  };
}

export function starting_state(tm: TM, input: string): TM_State {
  const tape = init_tape(input);
  //Copy input to tape
  for (let i = 0; i < input.length; i++) {
    tape[TAPE_CHUNK_LEN + i] = input[i];
  }
  return { state: tm.start_state, head: TAPE_CHUNK_LEN, tape };
}

// Return A TM_Result object resulting from executing the given TM on the given input string.
export function tm_execute(tm: TM, input: string): TM_Result {
  let current_state = starting_state(tm, input);
  while (current_state.state !== REJECT && current_state.state !== ACCEPT) {
    //Get new TM state
    current_state = tm_step(tm, current_state);
    //Extend tape if needed
    if (current_state.head < 0 || current_state.head >= current_state.tape.length) {
      current_state.tape = extend_tape(current_state.head, current_state.tape);
      if (current_state.head < 0) {
        current_state.head = TAPE_CHUNK_LEN - 1;
      }
    }
  }
  return {
    accept: current_state.state,
    on_tape: current_state.tape
      .filter((slot, i, t) => !should_trim(slot, i, t))
      .join(""),
  };
}
