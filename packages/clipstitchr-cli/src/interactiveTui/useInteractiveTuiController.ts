import { useApp, useStdout } from "ink";
import { useCallback, useMemo, useRef, useState } from "react";
import { dispatchSlashCommand } from "../interactiveShell/dispatchSlashCommand.js";
import { getInteractiveShellMenuTitle } from "../interactiveShell/getInteractiveShellMenuTitle.js";
import { getIsInteractivePromptCancelError } from "../interactiveShell/getIsInteractivePromptCancelError.js";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import type { InteractiveShellNotice } from "../interactiveShell/InteractiveShellNotice.js";
import type { InteractiveShellTransition } from "../interactiveShell/InteractiveShellTransition.js";
import { waitForMilliseconds } from "../utils/waitForMilliseconds.js";
import type { InteractiveTuiInput } from "./InteractiveTuiInput.js";
import type { InteractiveTuiMode } from "./InteractiveTuiMode.js";
import { captureInteractiveTuiActionOutput } from "./captureInteractiveTuiActionOutput.js";
import { getInteractiveTuiResultPageSize } from "./getInteractiveTuiResultPageSize.js";
import { runInteractiveTuiMenuAction } from "./runInteractiveTuiMenuAction.js";
import { setInteractiveTuiStdinIsReferenced } from "./setInteractiveTuiStdinIsReferenced.js";
import { useInteractiveTuiActivity } from "./useInteractiveTuiActivity.js";
import { useInteractiveTuiCommandComposer } from "./useInteractiveTuiCommandComposer.js";
import { useInteractiveTuiExitInput } from "./useInteractiveTuiExitInput.js";
import { useInteractiveTuiMenuNavigation } from "./useInteractiveTuiMenuNavigation.js";
import { useInteractiveTuiResultOutputNavigation } from "./useInteractiveTuiResultOutputNavigation.js";

export function useInteractiveTuiController(input: InteractiveTuiInput) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [currentMenu, setCurrentMenu] = useState<InteractiveShellMenu>(
    input.initialMenu ?? "main",
  );
  const [mode, setMode] = useState<InteractiveTuiMode>("menu");
  const [notice, setNotice] = useState<InteractiveShellNotice>();
  const [activeLabel, setActiveLabel] = useState<string>();
  const [context, setContext] = useState(input.context);
  const [resultLines, setResultLines] = useState<string[]>([]);
  const commandReturnMode = useRef<"menu" | "result">("menu");
  const { activities, appendActivity } = useInteractiveTuiActivity();

  const refreshContext = useCallback(async () => {
    if (input.readContext) {
      setContext(await input.readContext());
    }
  }, [input.readContext]);

  const openMenu = useCallback((menu: InteractiveShellMenu) => {
    setCurrentMenu(menu);
    setMode("menu");
    setNotice({
      kind: "info",
      message:
        menu === "main"
          ? "Back at the main menu."
          : `Opened ${getInteractiveShellMenuTitle(menu)}.`,
    });
  }, []);

  const finishTransition = useCallback(
    (transition: InteractiveShellTransition, successMessage: string) => {
      if (transition.exit) {
        setInteractiveTuiStdinIsReferenced({ isReferenced: false });
        exit();
        return;
      }

      setInteractiveTuiStdinIsReferenced({ isReferenced: true });
      setCurrentMenu(transition.menu);
      setMode("result");
      setActiveLabel(undefined);
      setNotice(
        transition.notice ?? {
          kind: "success",
          message: successMessage,
        },
      );
      appendActivity("success", successMessage);
    },
    [appendActivity, exit],
  );

  const finishError = useCallback(
    (error: unknown, label: string) => {
      const isCanceled = getIsInteractivePromptCancelError(error);
      const message = isCanceled
        ? `${label} was canceled.`
        : error instanceof Error
          ? error.message
          : String(error);

      setInteractiveTuiStdinIsReferenced({ isReferenced: true });
      setMode("result");
      setActiveLabel(undefined);
      setNotice({
        kind: isCanceled ? "info" : "error",
        message,
      });
      setResultLines((currentLines) => [
        ...currentLines,
        ...(currentLines.length > 0 ? [""] : []),
        `${isCanceled ? "[info]" : "[error]"} ${message}`,
      ]);

      if (!isCanceled) {
        appendActivity("error", message);
      }
    },
    [appendActivity],
  );

  const executeCommand = useCallback(
    async (commandLine: string) => {
      setMode("running");
      setActiveLabel(commandLine);
      setNotice(undefined);
      setResultLines([]);
      appendActivity("command", commandLine);
      await waitForMilliseconds(0);
      setInteractiveTuiStdinIsReferenced({ isReferenced: true });

      try {
        const transition = await captureInteractiveTuiActionOutput({
          onOutput: setResultLines,
          run: async () =>
            await dispatchSlashCommand({
              commandLine,
              currentMenu,
              options: input.options,
              services: input.services,
            }),
        });

        await refreshContext();
        finishTransition(transition, `Finished ${commandLine}.`);
      } catch (error) {
        finishError(error, commandLine);
      }
    },
    [
      appendActivity,
      currentMenu,
      finishError,
      finishTransition,
      input.options,
      input.services,
      refreshContext,
    ],
  );

  const commandComposer = useInteractiveTuiCommandComposer({
    isActive: mode === "command",
    onCancel: () => {
      setMode(commandReturnMode.current);
      setNotice(undefined);
    },
    onEmpty: () => {
      setNotice({
        kind: "info",
        message: "Type a command after the slash.",
      });
    },
    onRun: (commandLine) => {
      void executeCommand(commandLine);
    },
  });

  const openCommandComposer = useCallback(
    (initialCommand = "/") => {
      commandReturnMode.current = mode === "result" ? "result" : "menu";
      commandComposer.openCommandComposer(initialCommand);
      setMode("command");
      setNotice(undefined);
    },
    [commandComposer.openCommandComposer, mode],
  );

  const executeMenuChoice = useCallback(
    async (choice: InteractiveShellChoice<string>) => {
      if (choice.value === "result:back") {
        setMode("menu");
        setNotice(undefined);
        return;
      }

      if (choice.value === "nav:slash") {
        openCommandComposer();
        return;
      }

      if (choice.value === "nav:exit") {
        exit();
        return;
      }

      if (choice.value === "nav:back" || choice.value === "nav:main") {
        openMenu("main");
        return;
      }

      if (
        currentMenu === "main" &&
        (choice.value === "demo" ||
          choice.value === "products" ||
          choice.value === "queue" ||
          choice.value === "native" ||
          choice.value === "account")
      ) {
        openMenu(choice.value);
        return;
      }

      setMode("running");
      setActiveLabel(choice.name);
      setNotice(undefined);
      setResultLines([]);
      appendActivity("command", choice.name);
      await waitForMilliseconds(0);
      setInteractiveTuiStdinIsReferenced({ isReferenced: true });

      try {
        const transition = await captureInteractiveTuiActionOutput({
          onOutput: setResultLines,
          run: async () =>
            await runInteractiveTuiMenuAction({
              action: choice.value,
              menu: currentMenu,
              options: input.options,
              prompts: input.prompts,
              services: input.services,
            }),
        });

        await refreshContext();
        finishTransition(transition, `Finished ${choice.name}.`);
      } catch (error) {
        finishError(error, choice.name);
      }
    },
    [
      appendActivity,
      currentMenu,
      exit,
      finishError,
      finishTransition,
      input.options,
      input.prompts,
      input.services,
      openCommandComposer,
      openMenu,
      refreshContext,
    ],
  );

  const menuNavigation = useInteractiveTuiMenuNavigation({
    context,
    currentMenu,
    isActive: mode === "menu" || mode === "result",
    onBack: () => {
      if (mode === "result") {
        setMode("menu");
        setNotice(undefined);
        return;
      }

      openMenu("main");
    },
    onChoose: (choice) => {
      void executeMenuChoice(choice);
    },
    onOpenCommand: openCommandComposer,
    view: mode === "result" ? "result" : "menu",
  });

  const resultPageSize = getInteractiveTuiResultPageSize(stdout.rows);
  const resultLinesForDisplay = useMemo(
    () =>
      resultLines.length > 0
        ? resultLines
        : [notice?.message ?? "Finished without additional output."],
    [notice?.message, resultLines],
  );
  const resultStartIndex = useInteractiveTuiResultOutputNavigation({
    isActive: mode === "result",
    lines: resultLinesForDisplay,
    pageSize: resultPageSize,
  });

  useInteractiveTuiExitInput({
    isActive: mode !== "running",
    onExit: exit,
  });

  return {
    activeLabel,
    activities,
    choices: menuNavigation.choices,
    commandText: commandComposer.commandText,
    context,
    currentMenu,
    cursorIndex: commandComposer.cursorIndex,
    mode,
    notice,
    resultLines: resultLinesForDisplay,
    resultPageSize,
    resultStartIndex,
    selectedIndex: menuNavigation.selectedIndex,
    suggestionIndex: commandComposer.suggestionIndex,
    suggestions: commandComposer.suggestions,
  };
}
