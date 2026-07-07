import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";

export function createDemoAgentStartUrl(
  baseUrl: string,
  guide: DemoWalkthroughGuide,
) {
  const url = new URL(baseUrl);

  if (guide.flowPath?.startsWith("/")) {
    url.pathname = guide.flowPath;
  }

  return url.toString();
}
