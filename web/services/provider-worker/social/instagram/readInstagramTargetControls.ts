import { parseSocialTargetControls } from "@/lib/clipstitchr/social/parseSocialTargetControls";

export function readInstagramTargetControls(controlsJson: string) {
  const value = parseSocialTargetControls(controlsJson);

  return {
    shareToFeed:
      value.shareToFeed === undefined ? true : value.shareToFeed === true,
  };
}
