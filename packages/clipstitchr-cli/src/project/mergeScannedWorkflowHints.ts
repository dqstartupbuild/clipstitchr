import { createAppContextRouteTitle } from "./createAppContextRouteTitle.js";
import { getUniqueAppContextStrings } from "./getUniqueAppContextStrings.js";
import type { ScannedWorkflowHint } from "./ScannedWorkflowHint.js";

export function mergeScannedWorkflowHints(hints: ScannedWorkflowHint[]) {
  const groupedHints = new Map<string, ScannedWorkflowHint[]>();

  for (const hint of hints) {
    const key = hint.routePath ?? hint.title;
    groupedHints.set(key, [...(groupedHints.get(key) ?? []), hint]);
  }

  return Array.from(groupedHints.entries())
    .map(([key, group]) => {
      const routePath = group.find((hint) => hint.routePath)?.routePath;
      const title = routePath ? createAppContextRouteTitle(routePath) : key;
      const inputs = getUniqueAppContextStrings(
        group.flatMap((hint) => hint.inputs),
        20,
      );
      const buttons = getUniqueAppContextStrings(
        group.flatMap((hint) => hint.buttons),
        20,
      );
      const actions = getUniqueAppContextStrings(
        group.flatMap((hint) => hint.actions),
        24,
      );

      return {
        actions,
        buttons,
        inputs,
        routePath,
        sourceFiles: getUniqueAppContextStrings(
          group.flatMap((hint) => hint.sourceFiles),
          10,
        ),
        summary: [
          inputs.length ? `Inputs: ${inputs.slice(0, 6).join(", ")}` : "",
          buttons.length ? `Buttons: ${buttons.slice(0, 6).join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(". "),
        title,
      } satisfies ScannedWorkflowHint;
    })
    .filter(
      (hint) => hint.inputs.length || hint.buttons.length || hint.actions.length,
    )
    .sort((a, b) => {
      if (a.routePath && !b.routePath) {
        return -1;
      }

      if (!a.routePath && b.routePath) {
        return 1;
      }

      return a.title.localeCompare(b.title);
    })
    .slice(0, 24);
}
