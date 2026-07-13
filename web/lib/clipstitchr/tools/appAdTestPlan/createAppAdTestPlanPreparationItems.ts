import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";

export function createAppAdTestPlanPreparationItems(
  input: AppAdTestPlanInput,
) {
  const items: string[] = [];

  if (input.ugcOpeningCount < 2) {
    items.push(
      `Add ${2 - input.ugcOpeningCount} more UGC ${input.ugcOpeningCount === 1 ? "opening" : "openings"} so Wave 1 can compare at least two versions.`,
    );
  }

  if (input.demoCount < 1) {
    items.push("Add one product demo to give every opening the same handoff.");
  }

  if (input.hookCount < 1) {
    items.push("Add one hook so Wave 1 has a fixed message.");
  } else if (input.hookCount < 2) {
    items.push("Add one more hook direction before Wave 2.");
  }

  if (input.callToActionCount < 1) {
    items.push("Add one call to action so the first two waves stay comparable.");
  }

  if (
    input.demoCount === 1 &&
    input.callToActionCount === 1
  ) {
    items.push("Add a second demo or call to action before Wave 3.");
  }

  return items;
}
