import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
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

function normalizeScriptString(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

  if (!text || getCliprTextHasForbiddenCta(text)) {
    return fallback;
  }

  return text.slice(0, 4000);
}

function normalizeSlides(value: unknown, filledHook: string, slideCount: number) {
  const rawSlides = Array.isArray(value) ? value : [];
  const slides = rawSlides
    .map((slide) => normalizeString(slide, ""))
    .filter(Boolean)
    .slice(0, slideCount);

  return [
    filledHook,
    ...slides.filter((slide) => slide !== filledHook),
  ].slice(0, slideCount);
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
  slideCount,
}: {
  candidates: CliprHookTemplate[];
  durationSeconds: CliprDurationSeconds;
  outputText: string;
  providerModel: string;
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
  const filledHook = normalizeString(
    parsed.filledHook,
    selectedTemplate.template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, "$1"),
  );
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
    slides: normalizeSlides(parsed.slides, filledHook, slideCount),
    variablesUsed: normalizeVariables(parsed.variablesUsed),
  };
}
