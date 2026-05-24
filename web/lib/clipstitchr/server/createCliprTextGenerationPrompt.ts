import type { CliprCompositionStrategy } from "@/lib/clipstitchr/types/CliprCompositionStrategy";
import { defaultCliprContentType } from "@/lib/clipstitchr/constants/defaultCliprContentType";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

import { getCliprContentTypeLabel } from "@/lib/clipstitchr/utils/getCliprContentTypeLabel";
import { getCliprContentTypeUsesVoiceover } from "@/lib/clipstitchr/utils/getCliprContentTypeUsesVoiceover";

type CreateCliprTextGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  compositionStrategy?: CliprCompositionStrategy;
  contentType?: CliprContentType;
  durationSeconds: CliprDurationSeconds;
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  sceneCount?: number;
  slideCount: number;
};

const contentAngles = [
  "polarizing belief",
  "beginner mistake",
  "unpopular opinion",
  "confidence or status",
  "myth busting",
  "story or confession",
  "hard truth",
  "comparison",
  "tactical tip",
  "identity callout",
];

const followThroughArcs = [
  "hot take -> why people believe the wrong thing -> better reframe",
  "callout -> example behavior -> consequence -> fix",
  "story/confession -> mistake -> realization -> lesson",
  "comparison -> old way -> new way -> why it matters",
  "myth -> truth -> practical next step",
  "identity challenge -> emotional reason -> behavior change",
];

function getCliprContentRules({
  compositionStrategy,
  contentType,
  sceneCount,
}: {
  compositionStrategy: CliprCompositionStrategy;
  contentType: CliprContentType;
  sceneCount: number;
}) {
  if (contentType === "avatar-talking-head") {
    return [
      "- For Clipr, do not directly promote the product.",
      "- For Clipr, the product is background context only. The script spine must come from the audience, the problem, a belief, a mistake, or a useful reframe.",
      "- For Clipr, do not mention the product name, product features, app screens, onboarding steps, scans, dashboards, generated plans, or product-specific mechanisms.",
      "- For Clipr, do not paraphrase the product description as the script. The video should still make sense if the viewer never learns the product exists.",
      "- For Clipr, script must start with the hook and must be written as a natural spoken avatar monologue.",
      "- For Clipr, scenePlan must contain exactly one avatar scene and no supplemental scenes.",
      "- For Clipr, scenePlan[0].scriptText must match the full script, not a short summary.",
    ];
  }

  const productAllowed =
    contentType === "product-video" ||
    contentType === "value-video" ||
    contentType === "problem-solution" ||
    contentType === "objection-handler" ||
    contentType === "how-to" ||
    contentType === "soft-cta";
  const usesVoiceover = getCliprContentTypeUsesVoiceover(contentType);

  return [
    `- For Clipr, contentType is ${contentType} (${getCliprContentTypeLabel(contentType)}).`,
    `- For Clipr, scenePlan must contain exactly ${sceneCount} generated-video scene${sceneCount === 1 ? "" : "s"}.`,
    `- For Clipr, compositionStrategy is ${compositionStrategy}; ${
      compositionStrategy === "multi-scene"
        ? "each scene should be visually distinct and stitch cleanly in sequence."
        : "the single scene should carry the whole idea without needing extra cuts."
    }`,
    "- For Clipr, do not include baked-in captions, subtitles, lower thirds, or text in visualPrompt. Text belongs in overlayText only.",
    "- For Clipr, visualPrompt must also avoid visible words, letters, numbers, signs, labels, posters, packaging text, logos, watermarks, UI, phone screens, dashboards, app screens, social-media interfaces, speech bubbles, and graphic overlays.",
    "- For Clipr, visualPrompt must describe realistic vertical footage that a video model can generate.",
    usesVoiceover
      ? "- For Clipr, this is the only non-avatar format that may use spoken avatar-voice narration. script must be the voiceover narration, while visualPrompt must not show anyone speaking or lip-syncing."
      : "- For Clipr, this format must be silent footage. Do not write voiceover narration, dialogue, spoken lines, or talking-head delivery. script and scenePlan[].scriptText are planning notes only, not spoken audio.",
    contentType === "b-roll-reel"
      ? "- For Clipr, B-roll Reel must be b-roll only: no talking, no mouth-to-camera delivery, no lip-sync, no dialogue, no narrator, and no person visibly speaking."
      : usesVoiceover
        ? "- For Clipr, Voiceover Reel visuals should be silent b-roll under narration; do not show people speaking, lip-syncing, or addressing the camera."
        : "- For Clipr, generated scenes must not show people speaking, lip-syncing, or addressing the camera as if delivering lines.",
    "- For Clipr, overlayText must be one concise editable on-screen text layer when the format benefits from text.",
    productAllowed
      ? "- For Clipr, product details may shape the story, proof, examples, and soft CTA, but the result should still feel like creator content."
      : "- For Clipr, the product is background context only and should not be directly pitched.",
    contentType === "soft-cta" || contentType === "value-video"
      ? "- For Clipr, a soft CTA is allowed at the end, but it must be low-pressure and useful."
      : "- For Clipr, do not ask viewers to try, download, save, comment, follow, buy, book, subscribe, or sign up.",
  ];
}

function getPurposeRules(
  purpose: CliprTextPurpose,
  options: {
    compositionStrategy: CliprCompositionStrategy;
    contentType: CliprContentType;
    sceneCount: number;
  },
) {
  if (purpose === "clipr") {
    return getCliprContentRules(options);
  }

  if (purpose === "swipr") {
    return [
      "- For Swipr, use the product only as context for the audience, problem, and topic.",
      "- For Swipr, filledHook and middle slides must read like creator/value content, not product copy.",
      "- For Swipr, slides must contain exactly the requested slide count.",
      "- For Swipr, slides[0] must exactly match filledHook.",
      "- For Swipr, slides[0] must cause an immediate emotional reaction. The viewer must feel provoked, curious, or called out within the first second of reading.",
      "- For Swipr, middle slides must validate the bold claim from slide 1. Show proof, a story, a transformation, or a reframe that earns the viewer's trust.",
      "- For Swipr, middle slides must not mention the product name, product features, product benefits, or sound like a pitch.",
      "- For Swipr, the final slide must plug the product while the viewer's trust is highest. Use a soft CTA such as \"Use [product] when...\" or \"Make this easier with [product]\".",
      "- For Swipr, do not repeat the hook after slide 1 and do not make every slide another hook.",
      "- For Swipr, make every slide short enough for a vertical carousel image.",
      "- For Swipr, prefer identity-level claims the audience would defend or resist over informational tips.",
    ];
  }

  return [
    "- For Stitchr, the generated text should read like a human social hook, not a product line.",
    "- For Stitchr, use the product only as background context for what the audience cares about.",
    "- For Stitchr, do not mention the product name or product features unless the selected candidate template explicitly requires product_name and the result still sounds like a natural creator caption.",
    "- For Stitchr, overlayText must be one concise editable text overlay.",
    "- For Stitchr, write overlayText as a short-form hook that can sit over a UGC-then-demo sequence.",
    "- For Stitchr, the hook must cause a gut reaction in 2-3 seconds. Make a bold, specific claim the audience will emotionally resist or strongly agree with.",
    "- For Stitchr, the UGC clip is the reaction trigger and the Demo clip is the validation. The overlayText should amplify this arc, not describe it.",
    "- For Stitchr, prefer identity-level claims over informational hooks. Challenge a core belief the audience holds rather than sharing a safe tip.",
  ];
}

export function createCliprTextGenerationPrompt({
  candidates,
  compositionStrategy = "single-video",
  contentType = defaultCliprContentType,
  durationSeconds,
  fillers,
  product,
  purpose,
  sceneCount = 1,
  slideCount,
}: CreateCliprTextGenerationPromptOptions) {
  return [
    "Create short-form hook copy for ClipStitchr.",
    "Return only compact JSON with this exact shape:",
    '{"templateId":"one candidate id","filledHook":"short hook","variablesUsed":{"placeholder":"value"},"overlayText":"short editable overlay","slides":["first slide hook","supporting point"],"script":"30 or 60 second spoken script or plan","scenePlan":[{"sceneType":"avatar or generated-video","scriptText":"scene narration or planning copy","visualPrompt":"vertical video prompt with no baked-in text","estimatedDurationSeconds":10}]}',
    "Rules:",
    "- Audience and problem are the primary source of truth. Product details are only a proof bank and should not become the main topic.",
    "- Silently choose one content angle and one follow-through arc before writing. Do not name the angle or arc in the JSON.",
    "- Do not reuse phrases from Product details verbatim. Translate any useful product proof into an audience behavior, mistake, belief, or tension.",
    "- At most one product proof point may appear in the supporting content, and only when the purpose rules allow it.",
    "- Avoid ad-like language such as game changer, unlock, transform, powerful, seamless, revolutionary, and built for, unless the user provided that wording.",
    "- Avoid generic AI cadence. Use concrete, human phrasing with a point of view.",
    "- Except for the final Swipr CTA slide or a Clipr format that explicitly allows a soft CTA, do not ask viewers to try, download, save, comment, follow, buy, book, subscribe, or sign up.",
    "- Except for the final Swipr CTA slide or product-aware Clipr formats, do not write product-feature or product-benefit copy.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Keep the hook useful, specific, and under 18 words when possible.",
    "- If a candidate comes from a hook library, adapt the pattern to the product instead of copying it mechanically.",
    "- filledHook must be final human-readable copy, not a raw placeholder fill.",
    "- Rewrite filler values as needed so the sentence is grammatical. Change tense, article, plurality, or wording instead of pasting filler text verbatim.",
    "- Never return unresolved placeholders, placeholder labels, snake_case keys, or database-style labels in filledHook or slides.",
    "- Before returning JSON, silently reject any hook that reads like gibberish, has awkward duplicated words, or only makes sense if the reader sees the template.",
    ...getPurposeRules(purpose, {
      compositionStrategy,
      contentType,
      sceneCount,
    }),
    `Purpose: ${purpose}`,
    `Clipr content type: ${contentType}`,
    `Clipr content type label: ${getCliprContentTypeLabel(contentType)}`,
    `Clipr composition strategy: ${compositionStrategy}`,
    `Required Clipr scene count: ${sceneCount}`,
    `Target duration: ${durationSeconds} seconds`,
    `Slide count: ${slideCount}`,
    `Audience details: ${product.audienceDetails}`,
    `Inferred problem: ${product.inferredProblem ?? ""}`,
    `Pain points: ${product.inferredPainPoints.join("; ")}`,
    `Content angles to choose from: ${contentAngles.join("; ")}`,
    `Follow-through arcs to choose from: ${followThroughArcs.join("; ")}`,
    `Product name, for final CTA or proof only when allowed: ${product.name}`,
    `Product proof bank, not the script spine: ${product.productDetails}`,
    `Placeholder fillers: ${JSON.stringify(fillers)}`,
    `Candidate templates: ${JSON.stringify(
      candidates.map((candidate) => ({
        templateId: candidate.id,
        template: candidate.template,
        requiredVariables: candidate.requiredVariables,
        source: candidate.source,
      })),
    )}`,
  ].join("\n");
}
