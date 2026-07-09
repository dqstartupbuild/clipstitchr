import type { DemoAgentSurface } from "./DemoAgentSurface.js";
import { getDemoAgentSurfaceIsSupported } from "./getDemoAgentSurfaceIsSupported.js";

export function resolveDemoAgentSurface(input: {
  configSurface?: string;
  optionSurface?: string;
}): DemoAgentSurface {
  const surface = input.optionSurface ?? input.configSurface ?? "browser";

  if (!getDemoAgentSurfaceIsSupported(surface)) {
    throw new Error("Use --surface browser or --surface macos-window.");
  }

  return surface;
}
