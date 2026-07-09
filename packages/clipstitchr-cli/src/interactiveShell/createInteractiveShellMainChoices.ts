import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellContext } from "./InteractiveShellContext.js";
import type { InteractiveShellMainAction } from "./InteractiveShellMainAction.js";

export function createInteractiveShellMainChoices(input?: {
  context?: InteractiveShellContext;
  includeSlashCommand?: boolean;
}): InteractiveShellChoice<InteractiveShellMainAction>[] {
  const onboardingChoices: InteractiveShellChoice<InteractiveShellMainAction>[] =
    input?.context
      ? [
          ...(input.context.isAccountConnected
            ? []
            : [{ name: "Connect my account", value: "login" as const }]),
          ...(input.context.isRepoLinked
            ? []
            : [{ name: "Set up this repo", value: "link" as const }]),
        ]
      : [];
  const choices: InteractiveShellChoice<InteractiveShellMainAction>[] = [
    ...onboardingChoices,
    {
      name: "Demos",
      value: "demo",
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
      name: "Queue ready content",
      value: "queue",
    },
    {
      name: "Products",
      value: "products",
    },
    {
      name: "Setup and account",
      value: "account",
    },
    {
      name: "Show status",
      value: "status",
    },
  ];

  if (!input?.context) {
    choices.splice(
      choices.length - 2,
      0,
      {
        name: "Native setup and checks",
        value: "native",
      },
      {
        name: "Check settings",
        value: "doctor",
      },
    );
    choices.push({ name: "Update CLI", value: "update" });
  }

  if (input?.includeSlashCommand ?? true) {
    choices.push({
      name: "Type a slash command",
      value: "nav:slash",
    });
  }

  choices.push({ name: "Exit", value: "nav:exit" });
  return choices;
}
