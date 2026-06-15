import type { Doc } from "@/convex/_generated/dataModel";
import { formatStitchScoreSourceClipContext } from "@/lib/clipstitchr/server/formatStitchScoreSourceClipContext";

export function createStitchScorePrompt({
  sourceClips,
  stitch,
  videoInputDescription,
}: {
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

  return [
    "Score this finished ClipStitchr Stitch for short-form posting.",
    "A Stitch usually starts with a UGC or reaction clip, then moves into a demo or proof clip.",
    `Video input: ${videoInputDescription}`,
    "If a rendered stitch video is provided, score the rendered video first.",
    "If no rendered stitch video is provided, use the saved trim, playback, audio, overlay, caption, and source clip notes before scoring.",
    "Return compact JSON only with this exact shape:",
    '{"overallRetentionEstimate":0,"hookToDemoFlow":0,"summary":"one short reason for the score","dropOffRiskPoints":["timestamp or moment: why viewers may leave"],"suggestedTrims":["specific trim to try"],"suggestedOverlayText":["short overlay line"],"suggestedOpeningLine":"one stronger first line","quickEditSuggestions":{"trimStart":0,"trimEnd":null,"removeRanges":[{"start":4.2,"end":7.8,"reason":"Loading screen slows down the before/after payoff."}],"overlayText":{"replaceWith":"The moment I realized my landing page was the problem","reason":"Makes the hook clearer."},"crop":{"mode":"smart-9x16","removeBlackBars":true,"reason":"Keeps the important subject visible."},"summary":"Cut the slow section, tightened the hook text, and improved vertical framing."}}',
    "Rules:",
    "- overallRetentionEstimate is a 0-100 retention guess for this finished stitch, not a promise of real performance.",
    "- hookToDemoFlow is a 0-100 score for how naturally the opener earns the demo watch.",
    "- Drop-off risk points should be specific and plain, with timestamps or moments when possible.",
    "- Suggested trims should be concrete. Mention what to cut or where to start sooner.",
    "- Suggested overlay text should sound like a real person, not an ad.",
    "- Suggested opening line should be stronger than the current first beat and easy to read on a vertical video.",
    "- quickEditSuggestions should be concrete enough for one-click non-destructive edits.",
    "- Use removeRanges for boring internal sections. Use trimStart for dead air at the beginning and trimEnd when the payoff is complete.",
    "- Use overlayText.replaceWith when the stitch needs a stronger short hook.",
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
      sequenceSegments: stitch.sequenceSegments,
      ugcClipName: stitch.ugcClipName,
      ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
      ugcTrimRange: stitch.ugcTrimRange,
    })}`,
    `Source clip context:\n${sourceClipContext}`,
  ].join("\n");
}
