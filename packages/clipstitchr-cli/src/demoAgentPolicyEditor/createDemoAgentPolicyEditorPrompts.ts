import { confirm, input } from "@inquirer/prompts";
import type { DemoAgentPolicyEditorPrompts } from "./DemoAgentPolicyEditorPrompts.js";

export function createDemoAgentPolicyEditorPrompts(): DemoAgentPolicyEditorPrompts {
  return {
    confirm: async (options) => await confirm(options),
    input: async (options) => await input(options),
  };
}
