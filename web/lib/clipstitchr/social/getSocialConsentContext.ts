export function getSocialConsentContext(
  targets: Array<{
    controlsJson: string;
    platform: "tiktok" | "instagram";
    publishMode: "direct" | "draft";
  }>,
) {
  let hasDirectTikTokTarget = false;
  let hasTikTokBrandedContent = false;

  for (const target of targets) {
    if (target.platform !== "tiktok" || target.publishMode !== "direct") {
      continue;
    }

    hasDirectTikTokTarget = true;

    try {
      const controls = JSON.parse(target.controlsJson) as {
        brandContentToggle?: unknown;
      };
      hasTikTokBrandedContent ||= controls.brandContentToggle === true;
    } catch {
      // The server still validates malformed controls before resuming.
    }
  }

  return { hasDirectTikTokTarget, hasTikTokBrandedContent };
}
