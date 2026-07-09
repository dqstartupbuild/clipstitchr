import type { DemoCreationChoice } from "./DemoCreationChoice.js";

export function createDemoCreationChoices() {
  return [
    {
      name: "Record it myself",
      value: "manual",
    },
    {
      name: "Let AI record it for me",
      value: "agent",
    },
  ] satisfies DemoCreationChoice[];
}
