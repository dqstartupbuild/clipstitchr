import { readQuickEditSuggestions } from "./readQuickEditSuggestions.mjs";
import { getHookLabFinalizationNumber } from "./getHookLabFinalizationNumber.mjs";
import { getHookLabFinalizationR2Object } from "./getHookLabFinalizationR2Object.mjs";
import { getHookLabFinalizationString } from "./getHookLabFinalizationString.mjs";
import { getHookLabFinalizationTrimRange } from "./getHookLabFinalizationTrimRange.mjs";

export function parseHookLabVariantFinalizationInput(inputSnapshotJson) {
  const input = JSON.parse(inputSnapshotJson);

  if (!input || typeof input !== "object") {
    throw new Error("Invalid Hook Lab finalization input.");
  }

  const ugcDuration = getHookLabFinalizationNumber(
    input.ugcDuration,
    "UGC duration",
  );
  const demoDuration = getHookLabFinalizationNumber(
    input.demoDuration,
    "Demo duration",
  );

  return {
    clipId: getHookLabFinalizationString(input.clipId, "clip ID"),
    clipName: getHookLabFinalizationString(input.clipName, "clip name"),
    demoClipId: getHookLabFinalizationString(input.demoClipId, "Demo clip ID"),
    demoClipName: getHookLabFinalizationString(input.demoClipName, "Demo clip name"),
    demoDuration,
    demoPlaybackRate: input.demoPlaybackRate === 2 ? 2 : 1,
    demoQuickEdit: readQuickEditSuggestions(input.demoQuickEdit),
    demoTrimRange: getHookLabFinalizationTrimRange(
      input.demoTrimRange,
      demoDuration,
    ),
    generatedCaption:
      typeof input.generatedCaption === "string" && input.generatedCaption.trim()
        ? input.generatedCaption.trim().slice(0, 2_000)
        : undefined,
    hookLabIdeaId: getHookLabFinalizationString(
      input.hookLabIdeaId,
      "Hook Lab idea ID",
    ),
    hookLabIdeaUseId: getHookLabFinalizationString(
      input.hookLabIdeaUseId,
      "Hook Lab use ID",
    ),
    hookLabIdeaVariantId: getHookLabFinalizationString(
      input.hookLabIdeaVariantId,
      "Hook Lab version ID",
    ),
    hookLabIdeaVariantIndex: Number.isInteger(input.hookLabIdeaVariantIndex)
      ? input.hookLabIdeaVariantIndex
      : 0,
    includeDemoAudio: input.includeDemoAudio !== false,
    includeUgcAudio: input.includeUgcAudio === true,
    mode: input.mode === "longr" ? "longr" : "normal",
    music: input.music && typeof input.music === "object" ? input.music : undefined,
    productId: getHookLabFinalizationString(input.productId, "product ID"),
    providerJobId: getHookLabFinalizationString(
      input.providerJobId,
      "provider job ID",
    ),
    sourceVideoObject: getHookLabFinalizationR2Object(
      input.sourceVideoObject,
      "source video",
    ),
    stitchId: getHookLabFinalizationString(input.stitchId, "Stitch ID"),
    stitchName: getHookLabFinalizationString(input.stitchName, "Stitch name"),
    temporaryObjects: Array.isArray(input.temporaryObjects)
      ? input.temporaryObjects.flatMap((value) => {
          try {
            return [getHookLabFinalizationR2Object(value, "temporary object")];
          } catch {
            return [];
          }
        })
      : [],
    textOverlay: input.textOverlay,
    ugcDuration,
    ugcPlaybackRate: input.ugcPlaybackRate === 2 ? 2 : 1,
    ugcQuickEdit: readQuickEditSuggestions(input.ugcQuickEdit),
    ugcTrimRange: getHookLabFinalizationTrimRange(
      input.ugcTrimRange,
      ugcDuration,
    ),
  };
}
