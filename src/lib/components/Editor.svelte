<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import { Compartment, type Transaction } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import { basicSetup } from "codemirror";
  import { onMount } from "svelte";

  import { isDarkTheme } from "$lib/stores/theme";

  export let document = "";

  const baseTheme = EditorView.baseTheme({
    "&": {
      height: "11rem",
    },
    "&.cm-editor.cm-focused": {
      outline: "unset",
    },
    ".cm-content, .cm-scroller": {
      fontFamily: "'Cascadia Code', 'Jetbrains Mono', Hack, Menlo, monospace",
    },
  });

  const darkTheme = EditorView.theme(
    {
      ".cm-content": {
        caretColor: "white",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "white",
      },
    },
    { dark: true },
  );

  const lightTheme = EditorView.theme({}, { dark: false });

  let theme = new Compartment();
  let editorContainer: Element;
  onMount(() => {
    const editor = new EditorView({
      doc: document,
      parent: editorContainer,
      extensions: [basicSetup, baseTheme, theme.of(lightTheme)],

      // TODO: Devise a nicer way to do this, if possible.
      // Intercept all transactions and copy the updated editor state to the
      // exported document property.
      dispatch: (tr: Transaction) => {
        editor.update([tr]);
        document = editor.state.doc.toString();
      },
    });

    isDarkTheme.subscribe((isDarkTheme) => {
      if (isDarkTheme) {
        editor.dispatch({ effects: theme.reconfigure(darkTheme) });
      } else {
        editor.dispatch({ effects: theme.reconfigure(lightTheme) });
      }
    });

    // Focus the editor so that the user can immediately begin typing after page load.
    editor.focus();

    // TODO: Persist the editor state for each editor across navigation and (maybe?)
    //       reloads.
    return () => editor.destroy();
  });
</script>

<div class="outline outline-1" bind:this={editorContainer} />
