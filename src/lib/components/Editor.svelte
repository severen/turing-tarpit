<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import type { Transaction } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import { basicSetup } from "codemirror";
  import { onMount } from "svelte";

  export let document = "";

  const darkTheme = EditorView.theme(
    {
      "&": {
        color: "white",
        backgroundColor: "#034",
      },
      "&.cm-editor.cm-focused": {
        outline: "unset",
      },
      ".cm-content": {
        caretColor: "#0e9",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "#0e9",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#074",
      },
      ".cm-gutters": {
        backgroundColor: "#045",
        color: "#ddd",
        border: "none",
      },
    },
    { dark: true },
  );

  let editorContainer: Element;
  onMount(() => {
    const editor = new EditorView({
      doc: document,
      extensions: [basicSetup, darkTheme],
      parent: editorContainer,
      dispatch: (tr: Transaction) => {
        editor.update([tr]);
        document = editor.state.doc.toString();
      },
    });

    // TODO: Add a mechanism for storing editor state.
    return () => editor.destroy();
  });
</script>

<div class="outline outline-1" bind:this={editorContainer} />
