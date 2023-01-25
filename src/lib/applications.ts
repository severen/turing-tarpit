/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/** An application information object. */
export interface Application {
  /** The name of the application. */
  name: string;
  /** A brief description of the application. */
  description: string;
  /** The path to the application relative to the website root. */
  url: string;
}

// NOTE: This exists for use in the landing page and navigation bar.
/** The list of applications supported by the website. */
export const applications: Application[] = [
  {
    name: "λ-calculus",
    description: "create and test λ-calculus programs",
    url: "/lambda",
  },
  {
    name: "Turing Machines",
    description: "create and test Turing machines",
    url: "/turing",
  },
];
