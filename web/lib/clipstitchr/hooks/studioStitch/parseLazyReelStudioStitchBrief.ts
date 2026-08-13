import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import type { LazyReelMakeBriefData } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefData";

export function parseLazyReelStudioStitchBrief(payloadJson: string) {
  try {
    const result = JSON.parse(payloadJson) as {
      tool?: unknown;
      data?: Partial<LazyReelMakeBriefData>;
    };
    const data = result.data;
    if (
      result.tool !== "make_brief" ||
      !data ||
      !Array.isArray(data.hooks) ||
      !Array.isArray(data.beats) ||
      data.hooks.length === 0 ||
      data.beats.length === 0
    ) {
      return null;
    }
    const hook = data.hooks[0];
    const beats = data.beats;
    if (!hook?.text || !data.product || !data.objective) return null;
    const brief: HookLabCreativeBriefContent = {
      beatScript: beats.map((beat) => beat.voiceover || beat.beat).filter(Boolean),
      callToAction: `Take the next step with ${data.product}.`,
      closingCta: `Try ${data.product}.`,
      directionName: data.framework?.name ?? data.angle?.name ?? "LazyReel direction",
      footageNeeds: beats.map((beat) => beat.broll).filter(Boolean),
      hook: hook.text,
      onScreenTextByScene: beats.map((beat) => beat.onScreenText).filter(Boolean),
      openingVisual: beats[0]?.broll || hook.delivery,
      productProof: data.objective,
      sceneBySceneDirections: beats.map(
        (beat) => `${beat.beat}: ${beat.broll}`,
      ),
      soundOffOverlay: beats[0]?.onScreenText || hook.text,
      spokenLines: beats.map((beat) => beat.voiceover).filter(Boolean),
    };
    return brief;
  } catch {
    return null;
  }
}
