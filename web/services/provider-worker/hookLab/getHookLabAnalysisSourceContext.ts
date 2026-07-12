import { pickHookLabAnalysisSourceFields } from "./pickHookLabAnalysisSourceFields";

type HookLabAnalysisSourceContextOptions = {
  sourceDemoClip?: Record<string, unknown> | null;
  sourceStitch?: Record<string, unknown> | null;
  sourceUgcClip?: Record<string, unknown> | null;
};

export function getHookLabAnalysisSourceContext({
  sourceDemoClip,
  sourceStitch,
  sourceUgcClip,
}: HookLabAnalysisSourceContextOptions) {
  return {
    stitch: pickHookLabAnalysisSourceFields(sourceStitch, [
      "mode",
      "duration",
      "includeDemoAudio",
      "includeUgcAudio",
      "demoPlaybackRate",
      "ugcPlaybackRate",
      "socialCaption",
    ]),
    ugc: pickHookLabAnalysisSourceFields(sourceUgcClip, [
      "videoDescription",
      "mainPersonDescription",
      "outfitDescription",
      "locationDescription",
      "poseDescription",
      "duration",
      "tags",
    ]),
    demo: pickHookLabAnalysisSourceFields(sourceDemoClip, [
      "videoDescription",
      "productDescription",
      "locationDescription",
      "poseDescription",
      "duration",
      "tags",
    ]),
  };
}
