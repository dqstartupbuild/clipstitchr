import type { ToolLeadInput } from "./ToolLeadInput";
import { toolLeadEmailPattern } from "./toolLeadEmailPattern";
import { toolLeadFieldLimits } from "./toolLeadFieldLimits";

export function getToolLeadInputIsValid(input: ToolLeadInput) {
  return (
    input.name.length >= toolLeadFieldLimits.name.min &&
    input.name.length <= toolLeadFieldLimits.name.max &&
    input.email.length >= toolLeadFieldLimits.email.min &&
    input.email.length <= toolLeadFieldLimits.email.max &&
    toolLeadEmailPattern.test(input.email)
  );
}
