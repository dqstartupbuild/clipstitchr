import type { CliDemoAppContextRoute } from "@/lib/clipstitchr/server/cli/appContext/CliDemoAppContextRoute";
import { readCliDemoAppContextRoute } from "@/lib/clipstitchr/server/cli/appContext/readCliDemoAppContextRoute";

export function readCliDemoAppContextRoutes(
  value: unknown,
): CliDemoAppContextRoute[] {
  return Array.isArray(value)
    ? value
        .map(readCliDemoAppContextRoute)
        .filter((route): route is CliDemoAppContextRoute => route !== null)
        .slice(0, 16)
    : [];
}
