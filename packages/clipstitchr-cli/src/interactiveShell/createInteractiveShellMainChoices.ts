import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellMainAction } from "./InteractiveShellMainAction.js";

export function createInteractiveShellMainChoices(): InteractiveShellChoice<InteractiveShellMainAction>[] {
  return [
    {
      name: "Demos",
      value: "demo",
    },
    {
      name: "Products",
      value: "products",
    },
    {
      name: "Queue ready content",
      value: "queue",
    },
    {
      name: "Start new Stitchr work",
      value: "stitchr-new",
    },
    {
      name: "Start new Swipr drafts",
      value: "swipr-new",
    },
    {
      name: "Native setup and checks",
      value: "native",
    },
    {
      name: "Account and repo setup",
      value: "account",
    },
    {
      name: "Show status",
      value: "status",
    },
    {
      name: "Check settings",
      value: "doctor",
    },
    {
      name: "Update CLI",
      value: "update",
    },
    {
      name: "Type a slash command",
      value: "nav:slash",
    },
    {
      name: "Exit",
      value: "nav:exit",
    },
  ];
}
