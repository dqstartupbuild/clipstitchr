import type { ToolLeadInput } from "@/lib/clipstitchr/tools/toolLeads/ToolLeadInput";
import { toolLeadEmailPattern } from "@/lib/clipstitchr/tools/toolLeads/toolLeadEmailPattern";
import { toolLeadFieldLimits } from "@/lib/clipstitchr/tools/toolLeads/toolLeadFieldLimits";

export function getToolLeadInputIsValid(input: ToolLeadInput) {
  return (
    input.name.length >= toolLeadFieldLimits.name.min &&
    input.name.length <= toolLeadFieldLimits.name.max &&
    input.email.length >= toolLeadFieldLimits.email.min &&
    input.email.length <= toolLeadFieldLimits.email.max &&
    toolLeadEmailPattern.test(input.email)
  );
}
