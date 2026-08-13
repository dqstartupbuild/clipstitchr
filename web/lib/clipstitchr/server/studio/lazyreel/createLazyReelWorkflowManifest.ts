import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";
import type { LazyReelWorkflowManifestItem } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowManifestItem";
import { getLazyReelWorkflowClipCount } from "./getLazyReelWorkflowClipCount";

export function createLazyReelWorkflowManifest(input: {
  brief: string;
  definition: LazyReelWorkflowDefinition;
  product: string;
  targetDurationSeconds: number;
}): LazyReelWorkflowManifestItem[] {
  const isClipWorkflow = [
    "format_prompt_builder",
    "higgsfield_director",
    "ugc_ad_director",
    "ugc_ad_generator",
    "video_editor",
  ].includes(input.definition.key);

  if (!isClipWorkflow) {
    return input.definition.stages.map((stage, index) => ({
      id: `stage-${index + 1}`,
      instruction: `${stage.instruction} Brief: ${input.brief}${input.product ? ` Product: ${input.product}.` : ""}`,
      kind: "analysis-stage",
    }));
  }

  const clipCount = getLazyReelWorkflowClipCount(input.targetDurationSeconds);
  const baseDuration = input.targetDurationSeconds / clipCount;

  return Array.from({ length: clipCount }, (_, index) => {
    const isFirst = index === 0;
    const isLast = index === clipCount - 1;
    const role = isFirst ? "hook" : isLast ? "payoff" : "escalation";
    const start = Math.round(index * baseDuration * 10) / 10;
    const end = Math.round((index + 1) * baseDuration * 10) / 10;
    return {
      durationSeconds: Math.round((end - start) * 10) / 10,
      id: `clip-${index + 1}`,
      instruction: `${role} from ${start}s to ${end}s. One distinct 9:16 action and framing. ${isFirst ? "Open on an unresolved visual question without a title card." : isLast ? "Deliver the withheld payoff and hard-end." : "Change framing, escalate one beat, and keep the product as a helper."} Ground it in: ${input.brief}${input.product ? ` Product: ${input.product}.` : ""}`,
      kind: role,
    };
  });
}
