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
  import { variants } from "@catppuccin/palette";

  import { isDarkTheme } from "$lib/stores/theme";

  export let document = "";

  const ctpLatte = variants.latte;
  const ctpMacchiato = variants.macchiato;

  const baseTheme = EditorView.baseTheme({
    "&": {
      // TODO: Make the editor height be dynamic to fill up a certain portion of
      // the available space in the viewport.
      height: "14.5rem",
    },
    "&.cm-editor.cm-focused": {
      outline: "unset",
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "'JetBrains Mono', 'Cascadia Code', Hack, Menlo, monospace",
    },
    ".cm-gutters": {
      border: "none",
    },
  });

  const lightTheme = EditorView.theme(
    {
      "&": {
        backgroundColor: ctpLatte.surface0.rgb,
      },
      ".cm-content": {
        caretColor: ctpLatte.text.rgb,
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: ctpLatte.text.rgb,
      },
      ".cm-gutters": {
        color: ctpLatte.text.rgb,
        backgroundColor: ctpLatte.surface1.rgb,
      },
      // NOTE: Some transparency (30%) is added to ensure highlights are not covered
      //       on the active line.
      ".cm-activeLine, .cm-activeLineGutter": {
        backgroundColor: ctpLatte.surface2.hex + "4D",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: ctpLatte.overlay0.rgb,
      },
      ".cm-selectionMatch": {
        backgroundColor: ctpLatte.overlay0.rgb,
        outline: `1px solid ${ctpLatte.overlay2.rgb}`,
      },
      "&.cm-focused .cm-matchingBracket": {
        backgroundColor: ctpLatte.overlay0.rgb,
      },
      "&.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: ctpLatte.rosewater.rgb,
      },
    },
    { dark: false },
  );

  const darkTheme = EditorView.theme(
    {
      "&": {
        backgroundColor: ctpMacchiato.surface0.rgb,
      },
      ".cm-content": {
        caretColor: ctpMacchiato.text.rgb,
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: ctpMacchiato.text.rgb,
      },
      ".cm-gutters": {
        color: ctpMacchiato.text.rgb,
        backgroundColor: ctpMacchiato.surface1.rgb,
      },
      ".cm-activeLine, .cm-activeLineGutter": {
        // NOTE: Some transparency (30%) is added to ensure highlights are not covered
        //       on the active line.
        backgroundColor: ctpMacchiato.surface2.hex + "4D",
      },
      "&.cm-focused .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: ctpMacchiato.overlay0.rgb,
      },
      ".cm-selectionMatch": {
        backgroundColor: ctpMacchiato.overlay0.rgb,
        outline: `1px solid ${ctpMacchiato.overlay2.rgb}`,
      },
      "&.cm-focused .cm-matchingBracket": {
        backgroundColor: ctpMacchiato.overlay0.rgb,
      },
      "&.cm-focused .cm-nonmatchingBracket": {
        color: ctpMacchiato.crust.rgb,
        backgroundColor: ctpMacchiato.red.rgb,
      },
    },
    { dark: true },
  );

  let currentTheme = new Compartment();
  let editorContainer: Element;
  onMount(() => {
    const editor = new EditorView({
      doc: document,
      parent: editorContainer,
      extensions: [basicSetup, baseTheme, currentTheme.of(lightTheme)],

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
        editor.dispatch({ effects: currentTheme.reconfigure(darkTheme) });
      } else {
        editor.dispatch({ effects: currentTheme.reconfigure(lightTheme) });
      }
    });

    // Focus the editor so that the user can immediately begin typing after page load.
    editor.focus();

    // TODO: Persist the editor state for each editor across navigation and (maybe?)
    //       reloads.
    return () => editor.destroy();
  });
</script>

<div class="outline outline-1 outline-surface2" bind:this={editorContainer} />
