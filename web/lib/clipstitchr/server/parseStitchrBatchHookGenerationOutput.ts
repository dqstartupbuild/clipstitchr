import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import type { StitchrBatchHookPlanItem } from "@/lib/clipstitchr/types/StitchrBatchHookPlanItem";
import { createStitchSocialCaption } from "@/lib/clipstitchr/utils/createStitchSocialCaption";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";

type ParsedHookVariant = {
  angle?: unknown;
  reason?: unknown;
  text?: unknown;
};

type ParsedHookPlan = {
  angle?: unknown;
  caption?: unknown;
  filledHook?: unknown;
  hashtags?: unknown;
  hookVariants?: unknown;
  overlayText?: unknown;
  reason?: unknown;
  taskId?: unknown;
};

function normalizeString(value: unknown, fallback: string) {
  return sanitizeCliprGeneratedText(
    typeof value === "string" ? value : "",
    fallback,
  );
}

function normalizeVariantString(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
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

function normalizeHashtags(value: unknown) {
  const rawHashtags = Array.isArray(value) ? value : [];
  const hashtags = [
    ...rawHashtags.map(normalizeHashtag),
    "#ugc",
    "#productdemo",
    "#adcreative",
  ].filter(Boolean);

  return Array.from(new Set(hashtags)).slice(0, 5);
}

function normalizeHookVariants(plan: ParsedHookPlan, selectedHook: string) {
  const rawVariants = Array.isArray(plan.hookVariants)
    ? (plan.hookVariants as ParsedHookVariant[])
    : [];
  const variants = [
    {
      angle: normalizeVariantString(plan.angle, 90) || "Best fit",
      reason:
        normalizeVariantString(plan.reason, 140) ||
        "Matches the selected clips.",
      text: selectedHook,
    },
    ...rawVariants.map((variant) => ({
      angle: normalizeVariantString(variant.angle, 90) || "Hook option",
      reason: normalizeVariantString(variant.reason, 140),
      text: normalizeString(variant.text, ""),
    })),
  ];
  const seenHooks = new Set<string>();

  return variants
    .filter((variant) => {
      const key = variant.text.toLowerCase();

      if (!variant.text || seenHooks.has(key)) {
        return false;
      }

      seenHooks.add(key);
      return true;
    })
    .slice(0, 8);
}

export function parseStitchrBatchHookGenerationOutput({
  outputText,
  providerModel,
  providerPredictionId,
}: {
  outputText: string;
  providerModel: string;
  providerPredictionId?: string;
}): StitchrBatchHookPlanItem[] {
  const parsed = JSON.parse(getCliprJsonText(outputText)) as {
    plans?: unknown;
  };
  const rawPlans = Array.isArray(parsed.plans)
    ? (parsed.plans as ParsedHookPlan[])
    : [];

  return rawPlans
    .map((plan) => {
      const automationTaskId =
        typeof plan.taskId === "string" ? plan.taskId.trim() : "";
      const selectedHook = normalizeString(
        plan.overlayText || plan.filledHook,
        "",
      );
      const caption = normalizeString(plan.caption, selectedHook);
      const hashtags = normalizeHashtags(plan.hashtags);

      return {
        angle: normalizeVariantString(plan.angle, 90) || undefined,
        automationTaskId,
        caption,
        hashtags,
        hookOptions: normalizeHookVariants(plan, selectedHook),
        providerModel,
        providerPredictionId,
        reason: normalizeVariantString(plan.reason, 140) || undefined,
        selectedHook,
        socialCaption: createStitchSocialCaption({ caption, hashtags }),
      };
    })
    .filter((plan) => plan.automationTaskId && plan.selectedHook);
}
