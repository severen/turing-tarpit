

export type TM = {start_state: string, accept_states: Set<string>, delta: Map<string, Map<string, TM_Arc>>}
type TM_Arc = {write: string; move: string; next: string}
type TM_Update = {next_state: string, head_move: number}
type TM_Result = {accept: string, on_tape: string}

const new_arc = (write: string, move: string, next: string): TM_Arc => ({write, move, next});

const STATE_NAME = new RegExp("[A-Z||a-z]+[0-9]*");
const BLANK = "_";
const TAPE_CHUNK_LEN = 10;
const REJECT = "REJECT";
const ACCEPT = "ACCEPT";

function check_delta(delta: Map<string, Map<string, TM_Arc>>, accept_states: Set<string>) {
  for (let state of delta.keys()) {
    let arcs = delta.get(state)!;
    for (let read_symbol of arcs.keys()) {
      let arc = arcs.get(read_symbol)!;
      if (!delta.has(arc.next) && !accept_states.has(arc.next)) {
        throw Error(`Transision (${state}, ${read_symbol}, ${arc.write}, ${arc.move}, ${arc.next}) ends in a non-existant state`);
      }
    }
  }
}

function read_transistion(linenum: number, line: string): Array<string> {
  let items = line.split(" ");
  if (items.length != 5) {
    throw Error(`Line ${linenum}: Line must have five items`);
  }
  let [state, read, write, move, next] = items;
  if (state.search(STATE_NAME) != 0) {
    throw Error(`Line ${linenum}: State name ${state} is not valid`);
  }
  if (move != "L" && move != "R") {
    throw Error(`Line ${linenum}: Move symbol must be "L" or "R", found ${items[3]}`);
  }
  if (next.search(STATE_NAME) != 0) {
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
  for (let name of table.split("\n")[0].split(" ")) {
    if (name.search(STATE_NAME) != 0) {
      throw Error(`Line 1: State name ${name} is not valid`);
    }
  }
  let header = table.split("\n")[0];
  let start_state = header.split(" ")[0];
  let accept_states = new Set(header.split(" ").slice(1));
  let delta = new Map();
  for (let [linenum, line] of table.split("\n").slice(1).entries()) {
    line = line.trimStart();
    let [state, read, write, move, next] = read_transistion(linenum, line);
    if (delta.has(state)) {
      let reads: Map<string, TM_Arc> = delta.get(state);
      if (reads.has(read)) {
        throw Error(`Line ${linenum}: State ${state} already has a transiton for tape symbol ${read}`);
      }
      reads.set(read, new_arc(write, move, next))
    } else {
      let reads = new Map();
      reads.set(read, new_arc(write, move, next));
      delta.set(state, reads);
    }
  }
  check_delta(delta, accept_states);
  return {start_state, accept_states, delta};
}

function init_tape(input: string): Array<string> {
  let tape_length = TAPE_CHUNK_LEN;
  while (tape_length - input.length < 2*TAPE_CHUNK_LEN) {
    tape_length += TAPE_CHUNK_LEN;
  }
  return Array(tape_length).fill(BLANK);
}

function extend_tape(head: number, tape: Array<string>): Array<string> {
  if (head < 0) { //head has fallen off the left of the tape, so the head is now at the right end of the new chunk.
    return Array(TAPE_CHUNK_LEN).fill(BLANK).concat(tape);
  }
  //head has fallen off the right of the tape, just append a new chunk.
  return tape.concat(Array(TAPE_CHUNK_LEN).fill(BLANK));
  
}

function should_trim(slot: string, i: number, tape: Array<string>): boolean {
  if (slot != BLANK) {
    return false;
  }
  if (i > 0 && i < tape.length && tape[i - 1] != BLANK && tape[i + 1] != BLANK) {
    return false;
  }
  return true;
}

/** Returns a (new_state, head_move) pair resulting from one step of the TM exitution on the given tape.
*   Also updates the tape appropriately in place. If the TM reads a symbol off the tape that does not
*   have an assioated transistion from the current state the next_state will be REJECT.
*/
export function tm_step(tm: TM, state: string, tape: Array<string>, head: number): TM_Update {
    let state_lookup = tm.delta.get(state)!; // delta.get(state) is garanteed to exist as it is checked in check_delta.
    let transistion = state_lookup.get(tape[head]);
    if (transistion === undefined) {
      return {next_state: REJECT, head_move: 0};
    }
    tape[head] = transistion!.write;
    return {next_state: transistion!.next, head_move: transistion!.move == "R" ? 1 : -1};
}


export function tm_execute(tm: TM, input: string): TM_Result {
  let tape = init_tape(input);
  //Copy input to tape
  for (let i = 0; i < input.length; i++) {
    tape[TAPE_CHUNK_LEN + i] = input[i];
  }
  let head = TAPE_CHUNK_LEN;
  let spaces = Array(tape.length).fill(" ");
  
  let state = tm.start_state;
  while (!tm.accept_states.has(state) && state != REJECT) {
    //Print tape
    let temp = [...spaces];
    temp[head] = "^";
    console.log(tape.join("") + "\n" + temp.join("")); 
    //Get new TM state
    let update = tm_step(tm, state, tape, head);
    state = update.next_state;
    head += update.head_move;
    
    if (head < 0 || head >= tape.length) {
      tape = extend_tape(head, tape);
      if (head < 0) {
        head = TAPE_CHUNK_LEN - 1;
      }
    }
  }
  return {accept: state === ACCEPT ? ACCEPT : REJECT, on_tape: tape.filter((slot, i, t) => !should_trim(slot, i, t)).join("")};
}


// let table = `q0 q1
//              q0 a b R q0
//              q0 b a R q0
//              q0 _ _ R q1`;

let table = `q0 q6
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
             q5 y _ L q3`

let tm = read_transtion_table(table);
console.log(tm_execute(tm, "xyyx"));
console.log(tm_execute(tm, "xyxy"));
// console.log(tm_execute(tm, "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"));
