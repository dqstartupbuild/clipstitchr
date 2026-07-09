import { useApp } from "ink";
import { useCallback, useState } from "react";
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
import { runInteractiveTuiMenuAction } from "./runInteractiveTuiMenuAction.js";
import { setInteractiveTuiStdinIsReferenced } from "./setInteractiveTuiStdinIsReferenced.js";
import { useInteractiveTuiActivity } from "./useInteractiveTuiActivity.js";
import { useInteractiveTuiCommandComposer } from "./useInteractiveTuiCommandComposer.js";
import { useInteractiveTuiExitInput } from "./useInteractiveTuiExitInput.js";
import { useInteractiveTuiMenuNavigation } from "./useInteractiveTuiMenuNavigation.js";

export function useInteractiveTuiController(input: InteractiveTuiInput) {
  const { exit } = useApp();
  const [currentMenu, setCurrentMenu] = useState<InteractiveShellMenu>(
    input.initialMenu ?? "main",
  );
  const [mode, setMode] = useState<InteractiveTuiMode>("menu");
  const [notice, setNotice] = useState<InteractiveShellNotice>();
  const [activeLabel, setActiveLabel] = useState<string>();
  const { activities, appendActivity } = useInteractiveTuiActivity();

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

      setCurrentMenu(transition.menu);
      setMode("menu");
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

      setMode("menu");
      setActiveLabel(undefined);
      setNotice({
        kind: isCanceled ? "info" : "error",
        message,
      });

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
      appendActivity("command", commandLine);
      await waitForMilliseconds(0);
      setInteractiveTuiStdinIsReferenced({ isReferenced: true });

      try {
        const transition = await dispatchSlashCommand({
          commandLine,
          currentMenu,
          options: input.options,
          services: input.services,
        });

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
    ],
  );

  const commandComposer = useInteractiveTuiCommandComposer({
    isActive: mode === "command",
    onCancel: () => {
      setMode("menu");
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
      commandComposer.openCommandComposer(initialCommand);
      setMode("command");
      setNotice(undefined);
    },
    [commandComposer.openCommandComposer],
  );

  const executeMenuChoice = useCallback(
    async (choice: InteractiveShellChoice<string>) => {
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
      appendActivity("command", choice.name);
      await waitForMilliseconds(0);
      setInteractiveTuiStdinIsReferenced({ isReferenced: true });

      try {
        const transition = await runInteractiveTuiMenuAction({
          action: choice.value,
          menu: currentMenu,
          options: input.options,
          prompts: input.prompts,
          services: input.services,
        });

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
    ],
  );

  const menuNavigation = useInteractiveTuiMenuNavigation({
    currentMenu,
    isActive: mode === "menu",
    onBack: () => openMenu("main"),
    onChoose: (choice) => {
      void executeMenuChoice(choice);
    },
    onOpenCommand: openCommandComposer,
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
    currentMenu,
    cursorIndex: commandComposer.cursorIndex,
    mode,
    notice,
    selectedIndex: menuNavigation.selectedIndex,
    suggestionIndex: commandComposer.suggestionIndex,
    suggestions: commandComposer.suggestions,
  };
}
