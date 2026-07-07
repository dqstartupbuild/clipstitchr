import type { CliDemoAppContextRoute } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContextRoute";

const routeConfidenceValues = ["high", "medium", "low"] as const;

export function readCliDemoAppContextRoute(
  value: unknown,
): CliDemoAppContextRoute | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const confidence = routeConfidenceValues.find(
    (candidate) => candidate === raw.confidence,
  );
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const path = typeof raw.path === "string" ? raw.path.trim() : "";

  if (!confidence || !name) {
    return null;
  }

  return {
    confidence,
    name: name.slice(0, 120),
    ...(path ? { path: path.slice(0, 160) } : {}),
  };
}
