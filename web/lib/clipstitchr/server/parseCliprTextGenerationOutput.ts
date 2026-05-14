import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getCliprTextHasForbiddenCta } from "@/lib/clipstitchr/utils/getCliprTextHasForbiddenCta";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";
import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";

type ParsedCliprScene = {
  estimatedDurationSeconds?: unknown;
  sceneType?: unknown;
  scriptText?: unknown;
  visualPrompt?: unknown;
};

function normalizeString(value: unknown, fallback: string) {
  return sanitizeCliprGeneratedText(
    typeof value === "string" ? value : "",
    fallback,
  );
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
    product.productDetails ??
    "the messy part";

  return sanitizeCliprGeneratedText(source, "the messy part")
    .replace(/[.!?]+$/g, "")
    .slice(0, 90);
}

function createFallbackHook(product: ProductProfile, purpose: CliprTextPurpose) {
  if (purpose === "clipr") {
    return "The small workflow mistake most people miss";
  }

  if (purpose === "swipr") {
    return `What changes when ${product.name} handles the messy part`;
  }

  return `${product.name} makes the messy part easier to handle`;
}

function normalizeScriptString(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

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
    `The real issue is ${problem}`,
    "Most people notice it after the workflow is already messy",
    "That tiny bit of friction turns into another unfinished post",
    "The better move is making the next step obvious",
    "The payoff is fewer loose ends before you publish",
    "Simple systems win because you can actually repeat them",
  ];

  return fallbackSlides[(slideIndex - 1) % fallbackSlides.length];
}

function createSwiprCtaSlide(product: ProductProfile) {
  const problem = getProductProblemPhrase(product);

  return `Use ${product.name} when ${problem} starts slowing you down`;
}

function getSwiprSlideIsCta(slide: string, product: ProductProfile) {
  return (
    slide.toLowerCase().includes(product.name.toLowerCase()) &&
    /\b(use|make|start|turn|keep|bring|build|create|choose|get)\b/i.test(slide)
  );
}

function getSwiprSupportSlideIsEngagementOnly(
  slide: string,
  product: ProductProfile,
) {
  return (
    !slide.toLowerCase().includes(product.name.toLowerCase()) &&
    !/\b(feature|benefit|built for|made for|helps you|lets you|use it|use this|try it|download|sign up|buy)\b/i.test(
      slide,
    )
  );
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
    .map((slide) => normalizeString(slide, ""))
    .filter(Boolean)
    .slice(0, slideCount);

  if (purpose !== "swipr") {
    return [
      filledHook,
      ...slides.filter((slide) => slide !== filledHook),
    ].slice(0, slideCount);
  }

  const nextSlides = [filledHook];
  const supportSlides = slides.filter((slide) => slide !== filledHook);
  const generatedFinalSlide = supportSlides.at(-1) ?? "";
  const generatedCtaSlide = getSwiprSlideIsCta(generatedFinalSlide, product)
    ? generatedFinalSlide
    : "";
  const supportCandidates = generatedCtaSlide
    ? supportSlides.slice(0, -1)
    : supportSlides;

  for (const slide of supportCandidates) {
    if (nextSlides.length >= slideCount - 1) {
      break;
    }

    if (
      !nextSlides.includes(slide) &&
      getSwiprSupportSlideIsEngagementOnly(slide, product)
    ) {
      nextSlides.push(slide);
    }
  }

  while (nextSlides.length < Math.max(1, slideCount - 1)) {
    nextSlides.push(getSwiprFallbackSupportSlide(product, nextSlides.length));
  }

  if (slideCount > 1) {
    nextSlides.push(generatedCtaSlide || createSwiprCtaSlide(product));
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
          ? Math.min(durationSeconds, Math.max(4, scene.estimatedDurationSeconds))
          : durationSeconds,
    }));
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
    filledHook?: unknown;
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
  const script = normalizeScriptString(
    parsed.script,
    "",
  );
  const scenePlan = normalizeScenePlan(parsed.scenePlan, durationSeconds);
  const fallbackScript = scenePlan
    .map((scene) => scene.scriptText)
    .filter(Boolean)
    .join(" ")
    .trim();
  const finalScript =
    script ||
    fallbackScript ||
    `${filledHook}. Give the viewer a useful explanation without pitching a product.`;
  const finalScenePlan = scenePlan.length
    ? scenePlan.map((scene, index) => ({
        ...scene,
        index,
        sceneType: "avatar" as const,
        scriptText: finalScript,
        estimatedDurationSeconds: durationSeconds,
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

  return {
    filledHook,
    hookStyleKey: selectedTemplate.styleKey,
    hookTemplateId: selectedTemplate.id,
    overlayText: normalizeString(parsed.overlayText, filledHook),
    providerModel,
    scenePlan: finalScenePlan,
    script: finalScript,
    slides: normalizeSlides({
      filledHook,
      product,
      purpose,
      slideCount,
      value: parsed.slides,
    }),
    variablesUsed: normalizeVariables(parsed.variablesUsed),
  };
}
