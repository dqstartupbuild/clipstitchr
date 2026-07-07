import { cliDemoGuideNonActionableStepPattern } from "@/lib/clipstitchr/server/cli/demoGuides/cliDemoGuideNonActionableStepPattern";
import type { CliDemoGuideGenerationOutput } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerationOutput";
import {
  cliDemoGuideMaxStepCount,
  cliDemoGuideMinStepCount,
} from "@/lib/clipstitchr/server/cli/demoGuides/cliDemoGuideStepCountBounds";

const unsafeStepPattern =
  /\b(password|api key|secret|billing|payment|credit card|purchase|delete|remove account|private customer|real customer|production account)\b/i;

export function parseCliDemoGuideGenerationOutput(
  outputText: string,
): CliDemoGuideGenerationOutput {
  const trimmed = outputText.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim()
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
  const value = JSON.parse(jsonText) as unknown;

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AI guide must be a JSON object.");
  }

  const guide = value as Record<string, unknown>;
  const title = typeof guide.title === "string" ? guide.title.trim() : "";
  const goal = typeof guide.goal === "string" ? guide.goal.trim() : "";

  if (!title || title.length > 120) {
    throw new Error("AI guide title must be 1-120 characters.");
  }

  if (!goal || goal.length > 300) {
    throw new Error("AI guide goal must be 1-300 characters.");
  }

  if (!Array.isArray(guide.steps)) {
    throw new Error("AI guide steps must be an array.");
  }

  if (
    guide.steps.length < cliDemoGuideMinStepCount ||
    guide.steps.length > cliDemoGuideMaxStepCount
  ) {
    throw new Error("AI guide must have 3-8 steps.");
  }

  const seenIds = new Set<string>();
  const steps = guide.steps.map((step, index) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      throw new Error(`AI guide step ${index + 1} must be an object.`);
    }

    const record = step as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const label = typeof record.label === "string" ? record.label.trim() : "";

    if (id) {
      if (seenIds.has(id)) {
        throw new Error("AI guide step IDs must be unique.");
      }

      seenIds.add(id);
    }

    if (!label || label.length > 120) {
      throw new Error("AI guide step labels must be 1-120 characters.");
    }

    if (unsafeStepPattern.test(label)) {
      throw new Error("AI guide includes an unsafe step.");
    }

    if (cliDemoGuideNonActionableStepPattern.test(label)) {
      throw new Error("AI guide includes a non-actionable step.");
    }

    return { label };
  });

  return {
    goal,
    steps,
    title,
  };
}
