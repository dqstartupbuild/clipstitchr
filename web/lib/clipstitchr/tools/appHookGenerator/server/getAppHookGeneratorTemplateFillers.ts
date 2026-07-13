import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import type { RawCliprHookTemplate } from "@/lib/clipstitchr/types/RawCliprHookTemplate";
import { getAppHookGeneratorOutcomeFill } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorOutcomeFill";
import { getAppHookGeneratorTraitFill } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorTraitFill";

export function getAppHookGeneratorTemplateFillers(
  template: RawCliprHookTemplate,
  input: AppHookGeneratorRequest,
) {
  const problem = input.problem.replace(/[.!?]+$/g, "");
  const desiredOutcome = input.desiredOutcome.replace(/[.!?]+$/g, "");
  const frustration = `the frustration of ${problem}`;
  const normalizedOutcome = desiredOutcome.replace(/^to\s+/i, "");

  return {
    app_label: input.appName,
    audience: input.audience,
    chore: problem,
    goal: desiredOutcome,
    habit: `want this result: ${normalizedOutcome}`,
    identity:
      template.templateId === "APP-337"
        ? `${input.audience.charAt(0).toUpperCase()}${input.audience.slice(1)}`
        : input.audience,
    job_identity: input.audience,
    outcome: ["APP-080", "APP-520", "APP-527", "APP-772"].includes(
      template.templateId,
    )
      ? getAppHookGeneratorOutcomeFill(desiredOutcome, template.templateId)
      : desiredOutcome,
    pain:
      template.templateId === "APP-121"
        ? `wrestling with ${problem}`
        : ["APP-107", "APP-209", "APP-246", "APP-262", "APP-322"].includes(
              template.templateId,
            )
          ? frustration
          : problem,
    pain_point: problem,
    painful_thing: problem,
    problem,
    product_name: input.appName,
    result: desiredOutcome,
    task: `the work behind ${problem}`,
    tedious_thing: `the manual work behind ${problem}`,
    thing: template.templateId === "APP-609" ? input.audience : problem,
    topic: `working toward ${desiredOutcome}`,
    trait: getAppHookGeneratorTraitFill(template.templateId, normalizedOutcome),
    workflow: `approach to ${problem}`,
  };
}
