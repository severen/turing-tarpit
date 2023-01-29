<!-- @license
  SPDX-FileCopyrightText: 2022 Severen Redwood <me@severen.dev>
  SPDX-FileCopyrightText: 2022 Keetley Rate <fridgeineyes@gmail.com>
  SPDX-License-Identifier: AGPL-3.0-or-later
-->
<script lang="ts">
  import {
    Compartment,
    EditorState,
    StateEffect,
    type Transaction,
  } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import { basicSetup } from "codemirror";
  import { onMount } from "svelte";
  import { variants } from "@catppuccin/palette";

  import { page } from "$app/stores";
  import { isDarkTheme } from "$lib/stores/theme";

  export let document = "";
  export let key = `editor${$page.url.pathname}`;

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
      // NOTE: This should be kept in sync with the monospace fonts listed in
      //       tailwind.config.js.
      fontFamily: "'JetBrains Mono', 'Cascadia Code', Hack, Menlo, monospace",
    },
    ".cm-gutters": {
      border: "none",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "inherit",
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
      // Some transparency (30%) is added to ensure highlights are not covered on the
      // active line.
      "&.cm-focused .cm-activeLine, &.cm-focused .cm-activeLineGutter": {
        backgroundColor: ctpLatte.surface2.hex + "4D",
      },
      ".cm-selectionBackground": {
        backgroundColor: ctpLatte.overlay1.rgb,
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
      "&.cm-focused .cm-activeLine, &.cm-focused .cm-activeLineGutter": {
        // Some transparency (30%) is added to ensure highlights are not covered on the
        // active line.
        backgroundColor: ctpMacchiato.surface2.hex + "4D",
      },
      ".cm-selectionBackground": {
        backgroundColor: ctpMacchiato.overlay1.rgb,
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
  let editorContainer: HTMLDivElement;
  onMount(() => {
    const savedState = localStorage.getItem(key);

    const editor = new EditorView({
      parent: editorContainer,

      doc: document,
      state: savedState ? EditorState.fromJSON(JSON.parse(savedState)) : undefined,

      // TODO: Devise a nicer way to do this, if possible.
      // Intercept all transactions and copy the updated editor state to the
      // exported document property.
      dispatch: (tr: Transaction) => {
        editor.update([tr]);
        if (tr.docChanged) {
          document = editor.state.doc.toString();
        }
      },
    });

    // NOTE: The extensions must be set after the fact (i.e. not when creating the
    // EditorView) because the serialised and saved editor state does not seem to include
    // the list of extensions.
    editor.dispatch({
      effects: StateEffect.appendConfig.of([
        basicSetup,
        baseTheme,
        currentTheme.of(lightTheme),
      ]),
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

    return () => {
      localStorage.setItem(key, JSON.stringify(editor.state.toJSON()));
      editor.destroy();
    };
  });
</script>

<div class="outline outline-1 outline-overlay2" bind:this={editorContainer} />
