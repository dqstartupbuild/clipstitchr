import type { DemoAgentTargetMode } from "./DemoAgentTargetMode.js";
import { getDemoAgentUrlIsLocal } from "./getDemoAgentUrlIsLocal.js";

function readUrlOrigin(url: string) {
  return new URL(url).origin;
}

export function resolveDemoAgentTargetUrl(input: {
  configLiveUrl?: string;
  configUrl?: string;
  optionUrl?: string;
  productWebsiteUrl?: string;
  runningUrl?: string;
  targetMode: DemoAgentTargetMode;
}) {
  const configuredLiveUrl =
    input.configUrl && !getDemoAgentUrlIsLocal(input.configUrl)
      ? input.configUrl
      : undefined;
  const url =
    input.targetMode === "live"
      ? input.optionUrl ??
        input.productWebsiteUrl ??
        input.configLiveUrl ??
        configuredLiveUrl
      : input.optionUrl ?? input.runningUrl ?? input.configUrl;

  if (!url) {
    throw new Error(
      input.targetMode === "live"
        ? "Set a live site URL with --url or add a website URL to the ClipStitchr product."
        : "Set a local URL with --url or run `clipstitchr link` first.",
    );
  }

  readUrlOrigin(url);

  if (input.targetMode === "live" && getDemoAgentUrlIsLocal(url)) {
    throw new Error("Live demos need a public or staging URL, not localhost.");
  }

  if (input.targetMode === "local" && !getDemoAgentUrlIsLocal(url)) {
    throw new Error("Local demos need a localhost URL. Use --target live for a live site.");
  }

  return url;
}
