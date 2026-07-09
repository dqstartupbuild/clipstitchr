import type { DemoMenuChoice } from "./DemoMenuChoice.js";

export function createDemoMenuChoices(platform = process.platform) {
  const choices: DemoMenuChoice[] = [
    {
      name: "Record it myself",
      value: "manual",
    },
    {
      name: "Let AI record it for me",
      value: "agent",
    },
    {
      name: "Create a guide",
      value: "guide-create",
    },
    {
      name: "Show my guides",
      value: "guide-list",
    },
    {
      name: "Show a guide",
      value: "guide-show",
    },
    {
      name: "Edit a guide",
      value: "guide-edit",
    },
    {
      name: "Delete a guide",
      value: "guide-delete",
    },
    {
      name: "Set up my safety policy",
      value: "policy-init",
    },
    {
      name: "Check my safety policy",
      value: "policy-check",
    },
    {
      name: "Edit my safety policy",
      value: "policy-edit",
    },
    {
      name: "Upload a demo",
      value: "upload",
    },
    {
      name: "Show AI run logs",
      value: "logs",
    },
  ];

  if (platform === "darwin") {
    choices.push({
      name: "Set up Mac window recording",
      value: "native-setup",
    });
  }

  return choices;
}
