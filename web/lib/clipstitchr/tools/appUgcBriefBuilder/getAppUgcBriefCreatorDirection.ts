import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";
import type { AppUgcBriefTone } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefTone";

export function getAppUgcBriefCreatorDirection({
  creatorStyle,
  tone,
}: {
  creatorStyle: AppUgcBriefCreatorStyle;
  tone: AppUgcBriefTone;
}) {
  const styleDirection =
    creatorStyle === "direct-to-camera"
      ? "Lead with clear direct-to-camera takes, then capture a few silent support moments."
      : creatorStyle === "reaction-and-b-roll"
        ? "Let expressions and simple real-life actions carry the opening, with only a small amount of spoken footage."
        : "Balance direct-to-camera hooks with silent reactions and simple real-life b-roll.";
  const toneDirection =
    tone === "energetic"
      ? "Keep the delivery lively without sounding rushed or overhyped."
      : tone === "matter-of-fact"
        ? "Keep the delivery clear, direct, and grounded."
        : "Keep the delivery calm, natural, and relatable.";

  return `${styleDirection} ${toneDirection}`;
}
