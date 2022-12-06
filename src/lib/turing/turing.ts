// Turing Machine struct
// delta is a transition function mapping states to maps mapping tape symbols to transision arcs
export type TM = {
  start_state: string;
  accept_states: Set<string>;
  delta: Map<string, Map<string, TM_Arc>>;
};

// Struct for defining transisions in a TM
type TM_Arc = { write: string; move: string; next: string };
// Struct for specifing a step in a TM's excution
type TM_Update = { next_state: string; head_move: number };
/** Struct for defining the result of TM's excution.
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

const STATE_NAME = new RegExp("[A-Z||a-z]+[0-9]*");
const BLANK = "_";
const TAPE_CHUNK_LEN = 10;
const REJECT = "REJECT";
const ACCEPT = "ACCEPT";

function check_delta(
  delta: Map<string, Map<string, TM_Arc>>,
  accept_states: Set<string>,
) {
  for (const state of delta.keys()) {
    const arcs = delta.get(state)!;
    for (const read_symbol of arcs.keys()) {
      const arc = arcs.get(read_symbol)!;
      if (!delta.has(arc.next) && !accept_states.has(arc.next)) {
        throw Error(
          `Transision (${state}, ${read_symbol}, ${arc.write}, ${arc.move}, ${arc.next}) ends in a non-existant state`,
        );
      }
    }
  }
}

function read_transistion(linenum: number, line: string): Array<string> {
  const items = line.split(" ");
  if (items.length !== 5) {
    throw Error(`Line ${linenum}: Line must have five items`);
  }
  const [state, read, write, move, next] = items;
  if (state.search(STATE_NAME) !== 0) {
    throw Error(`Line ${linenum}: State name ${state} is not valid`);
  }
  if (move !== "L" && move !== "R") {
    throw Error(`Line ${linenum}: Move symbol must be "L" or "R", found ${items[3]}`);
  }
  if (next.search(STATE_NAME) !== 0) {
    throw Error(`Line ${linenum}: State name ${state} is not valid`);
  }
  return [state, read, write, move, next];
}

/** Returns a new TM object from a transistion table of the form
 *     StartState AcceptState1 AcceptState2 ...
 *     State ReadSymbol WriteSymbol HeadMove NextState
 *     ...
 *   Throws errors when:
 *     - The table as a line (excluding the header) without 5 items.
 *     - The HeadMove field in a transision is not "L" or "R".
 *     - The table contains multiple transisions for a state for the same tape symbol.
 *     - The table contains a transision with Nextstate that does not appear elsewhere
 *       in the table.
 *     - A state name doesn't start with a charater
 */

export function read_transtion_table(table: string): TM {
  for (const name of table.split("\n")[0].split(" ")) {
    if (name.search(STATE_NAME) !== 0) {
      throw Error(`Line 1: State name ${name} is not valid`);
    }
  }
  const header = table.split("\n")[0];
  const start_state = header.split(" ")[0];
  const accept_states = new Set(header.split(" ").slice(1));
  const delta = new Map();
  for (const [linenum, line] of table.split("\n").slice(1).entries()) {
    const trimline = line.trimStart();
    const [state, read, write, move, next] = read_transistion(linenum, trimline);
    if (delta.has(state)) {
      const reads: Map<string, TM_Arc> = delta.get(state);
      if (reads.has(read)) {
        throw Error(
          `Line ${linenum}: State ${state} already has a transiton for tape symbol ${read}`,
        );
      }
      reads.set(read, new_arc(write, move, next));
    } else {
      const reads = new Map();
      reads.set(read, new_arc(write, move, next));
      delta.set(state, reads);
    }
  }
  check_delta(delta, accept_states);
  return { start_state, accept_states, delta };
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

/** Returns a (new_state, head_move) pair resulting from one step of the TM exitution on the given tape.
 *   Also updates the tape appropriately in place. If the TM reads a symbol off the tape that does not
 *   have an assioated transistion from the current state the next_state will be REJECT.
 */
export function tm_step(
  tm: TM,
  state: string,
  tape: Array<string>,
  head: number,
): TM_Update {
  const state_lookup = tm.delta.get(state)!; // delta.get(state) is garanteed to exist as it is checked in check_delta.
  const transistion = state_lookup.get(tape[head]);
  if (transistion === undefined) {
    return { next_state: REJECT, head_move: 0 };
  }
  tape[head] = transistion!.write;
  return {
    next_state: transistion!.next,
    head_move: transistion!.move === "R" ? 1 : -1,
  };
}

/** Return A TM_Result object resulting from executing the given TM on the given input string.
 */
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
