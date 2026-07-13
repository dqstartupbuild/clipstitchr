import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";

export function getAppHookGeneratorSeed(input: AppHookGeneratorRequest) {
  const source = [
    input.appName,
    input.audience,
    input.problem,
    input.desiredOutcome,
    input.edgeLevel,
  ]
    .join("|")
    .toLowerCase();
  let hash = 2166136261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
