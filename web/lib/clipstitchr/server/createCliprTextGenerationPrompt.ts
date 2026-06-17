import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { SwiprSelectedSlideTextContext } from "@/lib/clipstitchr/types/SwiprSelectedSlideTextContext";
import { createStitchrHookGenerationPrompt } from "@/lib/clipstitchr/server/createStitchrHookGenerationPrompt";
import { createSwiprTextGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprTextGenerationPrompt";

type CreateCliprTextGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  durationSeconds: CliprDurationSeconds;
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  scriptIdea?: string;
  slideCount: number;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
  swiprSelectedSlideTextContext?: SwiprSelectedSlideTextContext;
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

function getLengthRule(
  purpose: CliprTextPurpose,
  durationSeconds: CliprDurationSeconds,
) {
  if (purpose === "clipr") {
    return [
      "Script length: Write as much spoken script as needed to fully explain",
      "the idea. Do not pad, rush, or force the script into a fixed 30 or 60",
      "second target.",
    ].join(" ");
  }

  return `Target duration: ${durationSeconds} seconds`;
}

function getPurposeRules(purpose: CliprTextPurpose) {
  if (purpose === "clipr") {
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

  return [];
}

export function createCliprTextGenerationPrompt({
  candidates,
  durationSeconds,
  fillers,
  product,
  purpose,
  scriptIdea,
  slideCount,
  stitchrClipContexts = [],
  swiprSelectedSlideTextContext,
}: CreateCliprTextGenerationPromptOptions) {
  if (purpose === "stitchr") {
    return createStitchrHookGenerationPrompt({
      durationSeconds,
      fillers,
      product,
      stitchrClipContexts,
    });
  }

  if (purpose === "swipr") {
    return createSwiprTextGenerationPrompt({
      candidates,
      fillers,
      product,
      scriptIdea,
      slideCount,
      swiprSelectedSlideTextContext,
    });
  }

  return [
    "Create short-form hook copy for ClipStitchr.",
    "Return only compact JSON with this exact shape:",
    '{"templateId":"one candidate id","filledHook":"short hook","variablesUsed":{"placeholder":"value"},"overlayText":"short editable overlay","slides":["first slide hook","supporting point"],"script":"spoken avatar script long enough to fully explain the idea","scenePlan":[{"sceneType":"avatar","scriptText":"the same full spoken script","visualPrompt":"vertical avatar video prompt","estimatedDurationSeconds":45}]}',
    "Rules:",
    "- Audience and problem are the primary source of truth. Product details are only a proof bank and should not become the main topic.",
    "- Silently choose one content angle and one follow-through arc before writing. Do not name the angle or arc in the JSON.",
    "- Do not reuse phrases from Product details verbatim. Translate any useful product proof into an audience behavior, mistake, belief, or tension.",
    "- At most one product proof point may appear in the supporting content, and only when the purpose rules allow it.",
    "- Avoid ad-like language such as game changer, unlock, transform, powerful, seamless, revolutionary, and built for, unless the user provided that wording.",
    "- Avoid generic AI cadence. Use concrete, human phrasing with a point of view.",
    "- Except for the final Swipr CTA slide, do not ask viewers to try, download, save, comment, follow, buy, book, subscribe, or sign up.",
    "- Except for the final Swipr CTA slide, do not write product-feature or product-benefit copy.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Keep the hook useful, specific, and under 18 words when possible.",
    "- If a candidate comes from a hook library, adapt the pattern to the product instead of copying it mechanically.",
    "- If a user script idea is provided, use it as the primary creative direction while still following every purpose rule.",
    "- When using a user script idea, preserve the intended topic, point of view, and concrete examples, but rewrite anything that is unclear, too promotional, or unsafe.",
    "- filledHook must be final human-readable copy, not a raw placeholder fill.",
    "- Rewrite filler values as needed so the sentence is grammatical. Change tense, article, plurality, or wording instead of pasting filler text verbatim.",
    "- Never return unresolved placeholders, placeholder labels, snake_case keys, or database-style labels in filledHook or slides.",
    "- Before returning JSON, silently reject any hook that reads like gibberish, has awkward duplicated words, or only makes sense if the reader sees the template.",
    ...getPurposeRules(purpose),
    `Purpose: ${purpose}`,
    getLengthRule(purpose, durationSeconds),
    `Slide count: ${slideCount}`,
    `Audience details: ${product.audienceDetails}`,
    `Inferred problem: ${product.inferredProblem ?? ""}`,
    `Pain points: ${product.inferredPainPoints.join("; ")}`,
    `Content angles to choose from: ${contentAngles.join("; ")}`,
    `Follow-through arcs to choose from: ${followThroughArcs.join("; ")}`,
    `Product name, for final CTA or proof only when allowed: ${product.name}`,
    `Product proof bank, not the script spine: ${product.productDetails}`,
    scriptIdea ? `User script idea: ${scriptIdea}` : "",
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
