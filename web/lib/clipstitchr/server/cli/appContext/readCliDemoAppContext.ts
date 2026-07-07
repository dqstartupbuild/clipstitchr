import type { CliDemoAppContext } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContext";
import { readCliDemoAppContextRoutes } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppContextRoutes";
import { readCliDemoAppWorkflowHints } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppWorkflowHints";

export function readCliDemoAppContext(
  value: unknown,
): CliDemoAppContext | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const routes = readCliDemoAppContextRoutes(raw.routes);
  const workflowHints = readCliDemoAppWorkflowHints(raw.workflowHints);

  if (!routes.length && !workflowHints.length) {
    return undefined;
  }

  return {
    projectDirectory:
      typeof raw.projectDirectory === "string"
        ? raw.projectDirectory.trim().slice(0, 120)
        : undefined,
    projectType:
      typeof raw.projectType === "string"
        ? raw.projectType.trim().slice(0, 40)
        : undefined,
    routes,
    workflowHints,
  };
}
