import type { DemoAgentPolicyEditorPrompts } from "../../src/demoAgentPolicyEditor/DemoAgentPolicyEditorPrompts.js";

export function createDemoAgentPolicyEditorTestPrompts(input: {
  calls: string[];
  confirmAnswers: boolean[];
  inputAnswers?: string[];
}): DemoAgentPolicyEditorPrompts {
  const confirmAnswers = [...input.confirmAnswers];
  const inputAnswers = [...(input.inputAnswers ?? [])];

  return {
    confirm: async (options) => {
      input.calls.push(`confirm:${options.message}:${options.default}`);
      return confirmAnswers.shift() ?? options.default;
    },
    input: async (options) => {
      input.calls.push(`input:${options.message}:${options.default}`);
      return inputAnswers.shift() ?? options.default;
    },
  };
}
