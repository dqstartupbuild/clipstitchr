import type { ScannedAppContext } from "../project/ScannedAppContext.js";

export function formatOpenAiComputerAppContext(
  appContext: ScannedAppContext | undefined,
) {
  if (!appContext) {
    return "No source-derived app hints are available.";
  }

  return JSON.stringify(
    {
      routes: appContext.routes.slice(0, 12).map((route) => ({
        name: route.name,
        path: route.path,
      })),
      workflowHints: appContext.workflowHints.slice(0, 8).map((hint) => ({
        actions: hint.actions.slice(0, 12),
        buttons: hint.buttons.slice(0, 12),
        featureLabels: hint.featureLabels.slice(0, 12),
        inputs: hint.inputs.slice(0, 12),
        routePath: hint.routePath,
        summary: hint.summary,
        title: hint.title,
      })),
    },
    null,
    2,
  );
}
