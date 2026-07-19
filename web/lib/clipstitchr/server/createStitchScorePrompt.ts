import type { Doc } from "@/convex/_generated/dataModel";
import { createQuickEditHybridPromptLines } from "@/lib/clipstitchr/server/createQuickEditHybridPromptLines";
import { formatQuickEditDetectorCandidatesForPrompt } from "@/lib/clipstitchr/server/formatQuickEditDetectorCandidatesForPrompt";
import { formatStitchScoreSourceClipContext } from "@/lib/clipstitchr/server/formatStitchScoreSourceClipContext";
import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";

export function createStitchScorePrompt({
  detectorCandidates = [],
  sourceClips,
  stitch,
  videoInputDescription,
}: {
  detectorCandidates?: QuickEditCandidate[];
  sourceClips: Doc<"videoClips">[];
  stitch: Doc<"stitches">;
  videoInputDescription: string;
}) {
  const overlayText =
    stitch.textOverlays
      ?.map((overlay) => overlay.text.trim())
      .filter(Boolean)
      .join(" | ") ||
    stitch.textOverlay?.text.trim() ||
    "No saved overlay text.";
  const sourceClipContext = sourceClips.length
    ? sourceClips
        .map((clip, index) =>
          formatStitchScoreSourceClipContext({ clip, index }),
        )
        .join("\n\n")
    : "No source clip metadata was available.";
  const firstScore = stitch.firstStitchScore ?? stitch.stitchScore;
  const scoreContext = firstScore
    ? {
        firstScore,
        currentPrimaryScoreBeforeRescore: stitch.stitchScore ?? null,
        mode: "rescore-reassessment",
      }
    : {
        mode: "first-score",
      };
  const responseShape = firstScore
    ? '{"overallRetentionEstimate":0,"hookToDemoFlow":0,"summary":"one short reason for the score","dropOffRiskPoints":["timestamp or moment: why viewers may leave"],"suggestedTrims":["specific trim or cut to try"],"suggestedOpeningLine":"one stronger opening beat to try","reassessment":{"completedImprovements":["first-score fix that now looks handled"],"remainingImprovements":["first-score fix that still needs work"],"postingReadiness":"short read on whether this is ready to post"},"quickEditSuggestions":{"trimStart":0,"trimEnd":null,"candidates":[{"start":4.2,"end":7.8,"confidence":0.86,"signals":["loading-text","low-motion"],"reason":"Loading screen slows down the before/after payoff.","stats":"Screen stays mostly unchanged."}],"removeRanges":[{"start":4.4,"end":7.4,"reason":"Loading screen slows down the before/after payoff."}],"crop":{"mode":"smart-9x16","removeBlackBars":true,"reason":"Keeps the important subject visible."},"summary":"Cut the slow section and improve vertical framing."}}'
    : '{"overallRetentionEstimate":0,"hookToDemoFlow":0,"summary":"one short reason for the score","dropOffRiskPoints":["timestamp or moment: why viewers may leave"],"suggestedTrims":["specific trim or cut to try"],"suggestedOpeningLine":"one stronger opening beat to try","quickEditSuggestions":{"trimStart":0,"trimEnd":null,"candidates":[{"start":4.2,"end":7.8,"confidence":0.86,"signals":["loading-text","low-motion"],"reason":"Loading screen slows down the before/after payoff.","stats":"Screen stays mostly unchanged."}],"removeRanges":[{"start":4.4,"end":7.4,"reason":"Loading screen slows down the before/after payoff."}],"crop":{"mode":"smart-9x16","removeBlackBars":true,"reason":"Keeps the important subject visible."},"summary":"Cut the slow section and improve vertical framing."}}';

  return [
    firstScore
      ? "Reassess this finished ClipStitchr Stitch for short-form posting."
      : "Score this finished ClipStitchr Stitch for short-form posting.",
    "A Stitch usually starts with a UGC or reaction clip, then moves into a demo or proof clip.",
    `Video input: ${videoInputDescription}`,
    "If a rendered stitch video is provided, score the rendered video first.",
    "If no rendered stitch video is provided, use the saved trim, playback, audio, overlay, caption, and source clip notes before scoring.",
    "Return compact JSON only with this exact shape:",
    responseShape,
    "Rules:",
    "- overallRetentionEstimate is a 0-100 retention guess for this finished stitch, not a promise of real performance.",
    "- hookToDemoFlow is a 0-100 score for how naturally the opener earns the demo watch.",
    "- When score context mode is rescore-reassessment, compare the current stitch against the archived first score instead of starting a brand-new critique.",
    "- For a rescore, use reassessment.completedImprovements for first-score trim, cut, crop, or pacing fixes that now look handled.",
    "- For a rescore, use reassessment.remainingImprovements for first-score fixes that still look missing or only partly handled.",
    "- For a first score, omit reassessment or leave its lists empty.",
    "- Drop-off risk points should be specific and plain, with timestamps or moments when possible.",
    "- Suggested trims should be concrete. Mention what to cut or where to start sooner.",
    "- Do not suggest new text overlay copy.",
    "- Do not return suggestedOverlayText or quickEditSuggestions.overlayText.",
    "- Suggested opening line should describe a stronger opening beat, not new overlay copy.",
    "- quickEditSuggestions should be concrete enough for non-destructive edits that a user can review before saving.",
    "- Use removeRanges for boring internal sections. Use trimStart for dead air at the beginning and trimEnd when the payoff is complete.",
    ...createQuickEditHybridPromptLines().map((line) => `- ${line}`),
    ...formatQuickEditDetectorCandidatesForPrompt(detectorCandidates).map(
      (line) => `- ${line}`,
    ),
    "- Use crop.mode smart-9x16 only when black bars or weak framing clearly hurt the finished video.",
    "- Keep every note short, human, and useful.",
    "- Do not mention models, AI, JSON, schemas, or internal app terms in the returned copy.",
    `Saved stitch settings: ${JSON.stringify({
      demoClipName: stitch.demoClipName,
      demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
      demoTrimRange: stitch.demoTrimRange,
      duration: stitch.duration,
      includeDemoAudio: stitch.includeDemoAudio !== false,
      includeUgcAudio: stitch.includeUgcAudio !== false,
      mode: stitch.mode ?? "normal",
      name: stitch.name,
      overlayText,
      quickEdit: stitch.quickEdit,
      sequenceSegments: stitch.sequenceSegments,
      demoQuickEdit: stitch.demoQuickEdit,
      ugcClipName: stitch.ugcClipName,
      ugcQuickEdit: stitch.ugcQuickEdit,
      ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
      ugcTrimRange: stitch.ugcTrimRange,
    })}`,
    `Score context: ${JSON.stringify(scoreContext)}`,
    `Source clip context:\n${sourceClipContext}`,
  ].join("\n");
}
