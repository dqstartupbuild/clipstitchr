import { useInput } from "ink";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSlashCommandSuggestionMatches } from "../interactiveShell/getSlashCommandSuggestionMatches.js";
import { createInteractiveTuiSuggestionCompletionText } from "./createInteractiveTuiSuggestionCompletionText.js";
import { getNextInteractiveTuiSelectionIndex } from "./getNextInteractiveTuiSelectionIndex.js";
import { resolveInteractiveTuiCommandSubmission } from "./resolveInteractiveTuiCommandSubmission.js";
import { useStableInteractiveTuiInputHandler } from "./useStableInteractiveTuiInputHandler.js";

export function useInteractiveTuiCommandComposer(input: {
  isActive: boolean;
  onCancel: () => void;
  onEmpty: () => void;
  onRun: (commandLine: string) => void;
}) {
  const [commandText, setCommandText] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | undefined>();
  const suggestions = useMemo(
    () => getSlashCommandSuggestionMatches(commandText).slice(0, 6),
    [commandText],
  );

  useEffect(() => {
    setSuggestionIndex(0);
  }, [commandText]);

  const updateCommandText = useCallback(
    (nextText: string, nextCursorIndex: number) => {
      setCommandText(nextText);
      setCursorIndex(nextCursorIndex);
      setHistoryIndex(undefined);
    },
    [],
  );

  const openCommandComposer = useCallback((initialCommand = "/") => {
    setCommandText(initialCommand);
    setCursorIndex(initialCommand.length);
    setHistoryIndex(undefined);
  }, []);

  const resetCommandComposer = useCallback(() => {
    setCommandText("");
    setCursorIndex(0);
    setHistoryIndex(undefined);
  }, []);

  const showCommandHistory = useCallback(
    (direction: "next" | "previous") => {
      if (commandHistory.length === 0) {
        return;
      }

      const nextIndex =
        direction === "previous"
          ? historyIndex === undefined
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1)
          : historyIndex === undefined
            ? undefined
            : historyIndex + 1 >= commandHistory.length
              ? undefined
              : historyIndex + 1;
      const nextCommand =
        nextIndex === undefined ? "/" : commandHistory[nextIndex] ?? "/";

      setHistoryIndex(nextIndex);
      setCommandText(nextCommand);
      setCursorIndex(nextCommand.length);
    },
    [commandHistory, historyIndex],
  );

  const handleInput = useStableInteractiveTuiInputHandler(
    (typedInput, key) => {
      if (key.escape) {
        resetCommandComposer();
        input.onCancel();
        return;
      }

      if (key.return) {
        const submission = resolveInteractiveTuiCommandSubmission({
          commandText,
          suggestion: suggestions[suggestionIndex],
        });

        if (submission.kind === "empty") {
          input.onEmpty();
          return;
        }

        if (submission.kind === "complete") {
          updateCommandText(
            submission.commandText,
            submission.commandText.length,
          );
          return;
        }

        setCommandHistory((current) =>
          current.at(-1) === submission.commandLine
            ? current
            : [...current, submission.commandLine],
        );
        resetCommandComposer();
        input.onRun(submission.commandLine);
        return;
      }

      if (key.tab) {
        const completion = suggestions[suggestionIndex];

        if (completion) {
          const completedText =
            createInteractiveTuiSuggestionCompletionText(completion);
          updateCommandText(completedText, completedText.length);
        }
        return;
      }

      if (key.ctrl && typedInput === "p") {
        showCommandHistory("previous");
        return;
      }

      if (key.ctrl && typedInput === "n") {
        showCommandHistory("next");
        return;
      }

      if (key.upArrow || key.downArrow) {
        if (historyIndex !== undefined || suggestions.length === 0) {
          showCommandHistory(key.downArrow ? "next" : "previous");
          return;
        }

        setSuggestionIndex((currentIndex) =>
          getNextInteractiveTuiSelectionIndex({
            currentIndex,
            direction: key.downArrow ? "down" : "up",
            itemCount: suggestions.length,
          }),
        );
        return;
      }

      if (key.leftArrow) {
        setCursorIndex((currentIndex) => Math.max(0, currentIndex - 1));
        return;
      }

      if (key.rightArrow) {
        setCursorIndex((currentIndex) =>
          Math.min(commandText.length, currentIndex + 1),
        );
        return;
      }

      if (key.home) {
        setCursorIndex(0);
        return;
      }

      if (key.end) {
        setCursorIndex(commandText.length);
        return;
      }

      if (key.ctrl && typedInput === "a") {
        setCursorIndex(0);
        return;
      }

      if (key.ctrl && typedInput === "e") {
        setCursorIndex(commandText.length);
        return;
      }

      if (key.backspace && cursorIndex > 0) {
        updateCommandText(
          `${commandText.slice(0, cursorIndex - 1)}${commandText.slice(cursorIndex)}`,
          cursorIndex - 1,
        );
        return;
      }

      if (key.delete && cursorIndex < commandText.length) {
        updateCommandText(
          `${commandText.slice(0, cursorIndex)}${commandText.slice(cursorIndex + 1)}`,
          cursorIndex,
        );
        return;
      }

      if (typedInput && !key.ctrl && !key.meta) {
        updateCommandText(
          `${commandText.slice(0, cursorIndex)}${typedInput}${commandText.slice(cursorIndex)}`,
          cursorIndex + typedInput.length,
        );
      }
    },
  );
  useInput(handleInput, { isActive: input.isActive });

  return {
    commandText,
    cursorIndex,
    openCommandComposer,
    suggestionIndex,
    suggestions,
  };
}
