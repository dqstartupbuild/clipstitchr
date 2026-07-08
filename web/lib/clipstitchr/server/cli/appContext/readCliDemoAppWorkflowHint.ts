import type { CliDemoAppWorkflowHint } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppWorkflowHint";
import { readCliDemoAppContextStringArray } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppContextStringArray";

export function readCliDemoAppWorkflowHint(
  value: unknown,
): CliDemoAppWorkflowHint | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  const routePath =
    typeof raw.routePath === "string" ? raw.routePath.trim() : "";
  const actions = readCliDemoAppContextStringArray(raw.actions, 12, 140);
  const buttons = readCliDemoAppContextStringArray(raw.buttons, 12, 140);
  const featureLabels = readCliDemoAppContextStringArray(
    raw.featureLabels,
    16,
    120,
  );
  const inputs = readCliDemoAppContextStringArray(raw.inputs, 12, 140);

  if (
    !title ||
    (!actions.length &&
      !buttons.length &&
      !featureLabels.length &&
      !inputs.length)
  ) {
    return null;
  }

  return {
    actions,
    buttons,
    featureLabels,
    inputs,
    ...(routePath ? { routePath: routePath.slice(0, 160) } : {}),
    sourceFiles: readCliDemoAppContextStringArray(raw.sourceFiles, 6, 180),
    summary: summary.slice(0, 500),
    title: title.slice(0, 120),
  };
}
