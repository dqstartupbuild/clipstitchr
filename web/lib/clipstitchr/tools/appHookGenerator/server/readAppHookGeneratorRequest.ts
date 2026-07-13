import { appHookGeneratorFieldLimits } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorFieldLimits";
import type { AppHookGeneratorEdgeLevel } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorEdgeLevel";
import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import { AppHookGeneratorInputError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorInputError";
import { readAppHookGeneratorText } from "@/lib/clipstitchr/tools/appHookGenerator/server/readAppHookGeneratorText";

const edgeLevels = new Set<AppHookGeneratorEdgeLevel>([
  "safe",
  "punchy",
  "bold",
]);

export function readAppHookGeneratorRequest(
  value: unknown,
): AppHookGeneratorRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppHookGeneratorInputError();
  }

  const source = value as Record<string, unknown>;
  const edgeLevel = source.edgeLevel;
  const variationIndex = source.variationIndex ?? 0;

  if (
    typeof edgeLevel !== "string" ||
    !edgeLevels.has(edgeLevel as AppHookGeneratorEdgeLevel) ||
    typeof variationIndex !== "number" ||
    !Number.isInteger(variationIndex) ||
    variationIndex < 0 ||
    variationIndex > appHookGeneratorFieldLimits.variationIndex
  ) {
    throw new AppHookGeneratorInputError();
  }

  return {
    appName: readAppHookGeneratorText(
      source.appName,
      appHookGeneratorFieldLimits.appName,
    ),
    audience: readAppHookGeneratorText(
      source.audience,
      appHookGeneratorFieldLimits.audience,
    ),
    desiredOutcome: readAppHookGeneratorText(
      source.desiredOutcome,
      appHookGeneratorFieldLimits.desiredOutcome,
    ),
    edgeLevel: edgeLevel as AppHookGeneratorEdgeLevel,
    problem: readAppHookGeneratorText(
      source.problem,
      appHookGeneratorFieldLimits.problem,
    ),
    variationIndex,
  };
}
