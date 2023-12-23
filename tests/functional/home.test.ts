/** @license
 * SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
 * SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect } from "@playwright/test";
import { chromium, type Browser, type Page } from "playwright";
import { preview, type PreviewServer } from "vite";
import { afterAll, beforeAll, describe, test } from "vitest";

describe("home page", async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    const port = 3000;

    server = await preview({ preview: { port } });
    browser = await chromium.launch();
    page = await browser.newPage({ baseURL: `http://localhost:${port}` });
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      // TODO: Figure out a more specific type for the error parameter.
      server.httpServer.close((error: unknown) => (error ? reject(error) : resolve()));
    });
  });

  // TODO: Implement meaningful E2E tests.
  test("index page has expected h1", async () => {
    await page.goto("/");
    await expect(page).toHaveTitle("The Turing Tarpit");
  });
});
