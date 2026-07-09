import type { DemoAgentSurface } from "./DemoAgentSurface.js";

export function getDemoAgentSurfaceIsSupported(
  surface: string,
): surface is DemoAgentSurface {
  return surface === "browser" || surface === "macos-window";
}
