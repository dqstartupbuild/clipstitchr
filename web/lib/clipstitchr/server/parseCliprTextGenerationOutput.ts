import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createStitchSocialCaption } from "@/lib/clipstitchr/utils/createStitchSocialCaption";
import { createSwiprPostDescriptionFallback } from "@/lib/clipstitchr/utils/createSwiprPostDescriptionFallback";
import { createSwiprSocialCaption } from "@/lib/clipstitchr/utils/createSwiprSocialCaption";
import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";
import { normalizeSwiprPostDescription } from "@/lib/clipstitchr/utils/normalizeSwiprPostDescription";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";
import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import { sanitizeGeneratedLongFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedLongFormText";
import { sanitizeGeneratedShortFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedShortFormText";

type ParsedCliprScene = {
  estimatedDurationSeconds?: unknown;
  sceneType?: unknown;
  scriptText?: unknown;
  visualPrompt?: unknown;
};

type ParsedStitchrHookVariant = {
  angle?: unknown;
  reason?: unknown;
  text?: unknown;
};

function normalizeString(value: unknown, fallback: string) {
  return sanitizeCliprGeneratedText(
    typeof value === "string" ? value : "",
    fallback,
  );
}

function normalizeSwiprSlideString(value: unknown) {
  return sanitizeGeneratedShortFormText({
    fallback: "",
    maxLength: 120,
    text: typeof value === "string" ? value : "",
  });
}

function getGeneratedHookIsReadable(
  hook: string,
  template: CliprHookTemplate,
) {
  const words = hook.split(/\s+/).filter(Boolean);
  const requiredVariableLabels = template.requiredVariables.map((variable) =>
    variable.replace(/_/g, " "),
  );

  return (
    words.length >= 3 &&
    words.length <= 24 &&
    !/{{|}}/.test(hook) &&
    !/\b[a-z]+_[a-z_]+\b/.test(hook) &&
    !/\b(product details|problem solved|pain point|placeholder)\s*:/i.test(
      hook,
    ) &&
    !/\b(\w+)\s+\1\b/i.test(hook) &&
    !/\b(a|an|the)\s+(a|an|the)\b/i.test(hook) &&
    !/\b(about|for|from|in|of|on|to|with|without)\s+(about|for|from|in|of|on|to|with|without)\b/i.test(
      hook,
    ) &&
    !requiredVariableLabels.some((label) =>
      new RegExp(
        `\\b(about|for|from|in|of|on|to|with|without)\\s+${escapeRegExp(
          label,
        )}\\b`,
        "i",
      ).test(hook),
    )
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getProductProblemPhrase(product: ProductProfile) {
  const source =
    product.inferredPainPoints[0] ??
    product.inferredProblem ??
    "the messy part";

  return sanitizeCliprGeneratedText(source, "the messy part")
    .replace(/[.!?]+$/g, "")
    .slice(0, 90);
}

function createFallbackHook(product: ProductProfile, purpose: CliprTextPurpose) {
  const problem = getProductProblemPhrase(product);

  if (purpose === "clipr") {
    return `The overlooked detail: ${problem}`.slice(0, 120);
  }

  if (purpose === "swipr") {
    return `Start here: ${problem}`.slice(0, 120);
  }

  return `The visible change: ${problem}`.slice(0, 120);
}

function normalizeHashtag(value: unknown) {
  const text =
    typeof value === "string"
      ? value
          .trim()
          .replace(/^#+/g, "")
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase()
      : "";

  return text ? `#${text}` : "";
}

function createProductHashtag(product: ProductProfile) {
  return normalizeHashtag(product.name) || "#productdemo";
}

function normalizeHashtags(
  value: unknown,
  product: ProductProfile,
  purpose: CliprTextPurpose,
) {
  const rawHashtags = Array.isArray(value) ? value : [];
  const generatedHashtags = rawHashtags.map(normalizeHashtag).filter(Boolean);

  if (purpose === "swipr") {
    return [...new Set(generatedHashtags)].slice(0, 3);
  }

  const fallbackHashtags = [
    createProductHashtag(product),
    "#ugc",
    "#productdemo",
    "#adcreative",
    "#creatorsoftiktok",
  ];
  const hashtags = [
    ...generatedHashtags,
    ...fallbackHashtags,
  ].filter(Boolean);

  return [...new Set(hashtags)].slice(0, 5);
}

function normalizeScriptString(value: unknown, fallback: string) {
  const text = sanitizeGeneratedLongFormText({
    fallback,
    maxLength: 4000,
    text: typeof value === "string" ? value : "",
  }).replace(/\s+/g, " ");

  if (!text || getCliprTextHasForbiddenCta(text)) {
    return fallback;
  }

  return text.slice(0, 4000);
}

function getSwiprFallbackSupportSlide(
  product: ProductProfile,
  slideIndex: number,
) {
  const problem = getProductProblemPhrase(product);
  const fallbackSlides = [
    `It usually starts as ${problem}`,
    "Then the workaround becomes the routine",
    "That is why the next step matters",
    "Make the obvious path easier to take",
    "Less friction means more follow-through",
    "Small systems work when they feel repeatable",
  ];

  return fallbackSlides[(slideIndex - 1) % fallbackSlides.length];
}

function createSwiprCtaSlide(product: ProductProfile) {
  return product.websiteUrl
    ? "Visit the site when you're ready"
    : "Follow for more like this";
}

function normalizeSlides({
  filledHook,
  product,
  purpose,
  slideCount,
  value,
}: {
  filledHook: string;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  slideCount: number;
  value: unknown;
}) {
  const rawSlides = Array.isArray(value) ? value : [];
  const slides = rawSlides
    .map((slide) =>
      purpose === "swipr"
        ? normalizeSwiprSlideString(slide)
        : normalizeString(slide, ""),
    )
    .filter(Boolean)
    .slice(0, slideCount);

  if (purpose === "stitchr") {
    return [filledHook];
  }

  if (purpose !== "swipr") {
    return [
      filledHook,
      ...slides.filter((slide) => slide !== filledHook),
    ].slice(0, slideCount);
  }

  const nextSlides = slides.length ? slides : [filledHook];

  if (slideCount > 1 && nextSlides[0] !== filledHook) {
    nextSlides[0] = filledHook;
  }

  while (nextSlides.length < slideCount) {
    nextSlides.push(
      nextSlides.length === slideCount - 1
        ? createSwiprCtaSlide(product)
        : getSwiprFallbackSupportSlide(product, nextSlides.length),
    );
  }

  return nextSlides.slice(0, slideCount);
}

function normalizeVariables(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [key, typeof entry === "string" ? entry.trim() : ""])
      .filter(([, entry]) => entry),
  );
}

function normalizeSceneType(): "avatar" {
  return "avatar";
}

function normalizeScenePlan(
  value: unknown,
  durationSeconds: CliprDurationSeconds,
): CliprScenePlan[] {
  const rawScenes = Array.isArray(value) ? value : [];

  return rawScenes
    .slice(0, 1)
    .map((scene: ParsedCliprScene, index) => ({
      id: createId(),
      index,
      sceneType: normalizeSceneType(),
      scriptText: normalizeScriptString(
        scene.scriptText,
        "Explain the idea simply.",
      ),
      visualPrompt: normalizeString(
        scene.visualPrompt,
        "Vertical short-form video, natural light, clear subject, steady camera.",
      ),
      estimatedDurationSeconds:
        typeof scene.estimatedDurationSeconds === "number"
          ? Math.max(4, scene.estimatedDurationSeconds)
          : durationSeconds,
    }));
}

function normalizeHookVariantString(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function normalizeStitchrHookVariants({
  filledHook,
  selectedTemplate,
  value,
}: {
  filledHook: string;
  selectedTemplate: CliprHookTemplate;
  value: unknown;
}): StitchrHookVariant[] {
  const rawVariants = Array.isArray(value) ? value : [];
  const variants = rawVariants
    .map((variant: ParsedStitchrHookVariant) => {
      const text = normalizeString(variant.text, "");

      return {
        angle:
          normalizeHookVariantString(variant.angle, 90) || "Hook Lab pick",
        reason: normalizeHookVariantString(variant.reason, 140),
        text,
      };
    })
    .filter((variant) => getGeneratedHookIsReadable(variant.text, selectedTemplate));
  const rankedVariants = [
    {
      angle: variants[0]?.angle || "Best fit",
      reason: variants[0]?.reason || "Matches the selected clips and product.",
      text: filledHook,
    },
    ...variants.filter((variant) => variant.text !== filledHook),
  ];
  const seenHooks = new Set<string>();

  return rankedVariants
    .filter((variant) => {
      const dedupeKey = variant.text.toLowerCase();

      if (seenHooks.has(dedupeKey)) {
        return false;
      }

      seenHooks.add(dedupeKey);
      return true;
    })
    .slice(0, 8);
}

export function parseCliprTextGenerationOutput({
  candidates,
  durationSeconds,
  outputText,
  providerModel,
  product,
  purpose,
  slideCount,
}: {
  candidates: CliprHookTemplate[];
  durationSeconds: CliprDurationSeconds;
  outputText: string;
  providerModel: string;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  slideCount: number;
}): CliprTextGeneration {
  const parsed = JSON.parse(getCliprJsonText(outputText)) as {
    caption?: unknown;
    description?: unknown;
    filledHook?: unknown;
    hashtags?: unknown;
    hookVariants?: unknown;
    overlayText?: unknown;
    scenePlan?: unknown;
    script?: unknown;
    slides?: unknown;
    templateId?: unknown;
    variablesUsed?: unknown;
  };
  const selectedTemplate =
    candidates.find((candidate) => candidate.id === parsed.templateId) ??
    candidates[0];
  const candidateFilledHook = normalizeString(parsed.filledHook, "");
  const filledHook = getGeneratedHookIsReadable(
    candidateFilledHook,
    selectedTemplate,
  )
    ? candidateFilledHook
    : createFallbackHook(product, purpose);
  const caption =
    purpose === "stitchr" || purpose === "swipr"
      ? normalizeString(parsed.caption, filledHook)
      : "";
  const hashtags =
    purpose === "stitchr" || purpose === "swipr"
      ? normalizeHashtags(parsed.hashtags, product, purpose)
      : [];
  const script =
    purpose === "stitchr" ? "" : normalizeScriptString(parsed.script, "");
  const scenePlan =
    purpose === "stitchr"
      ? []
      : normalizeScenePlan(parsed.scenePlan, durationSeconds);
  const fallbackScript = scenePlan
    .map((scene) => scene.scriptText)
    .filter(Boolean)
    .join(" ")
    .trim();
  const finalScript =
    purpose === "stitchr"
      ? ""
      : script ||
        fallbackScript ||
        `${filledHook}. Give the viewer a useful explanation without pitching a product.`;
  const finalScenePlan =
    purpose === "stitchr"
      ? []
      : scenePlan.length
        ? scenePlan.map((scene, index) => ({
            ...scene,
            index,
            sceneType: "avatar" as const,
            scriptText: finalScript,
          }))
        : [
            {
              id: createId(),
              index: 0,
              sceneType: "avatar" as const,
              scriptText: finalScript,
              visualPrompt:
                "Vertical short-form talking scene with a clear, natural delivery.",
              estimatedDurationSeconds: durationSeconds,
            },
          ];
  const slides = normalizeSlides({
    filledHook,
    product,
    purpose,
    slideCount,
    value: parsed.slides,
  });
  const description =
    purpose === "swipr"
      ? normalizeSwiprPostDescription({
          fallback: createSwiprPostDescriptionFallback({
            caption,
            product,
            slides,
          }),
          value: parsed.description,
        })
      : "";
  const socialCaption =
    purpose === "swipr"
      ? createSwiprSocialCaption({ caption, description, hashtags })
      : purpose === "stitchr"
        ? createStitchSocialCaption({ caption, hashtags })
        : "";

  return {
    filledHook,
    caption,
    description,
    hashtags,
    hookVariants:
      purpose === "stitchr"
        ? normalizeStitchrHookVariants({
            filledHook,
            selectedTemplate,
            value: parsed.hookVariants,
          })
        : [],
    hookStyleKey: selectedTemplate.styleKey,
    hookTemplateId: selectedTemplate.id,
    overlayText: normalizeString(parsed.overlayText, filledHook),
    providerModel,
    scenePlan: finalScenePlan,
    script: finalScript,
    slides,
    socialCaption,
    variablesUsed: normalizeVariables(parsed.variablesUsed),
  };
}
