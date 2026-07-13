import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import { curatedAppHookTemplateIds } from "@/lib/clipstitchr/tools/appHookGenerator/server/curatedAppHookTemplateIds";
import { getAppHookGeneratorSeed } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorSeed";

export function selectAppHookGeneratorTemplateIds(
  input: AppHookGeneratorRequest,
) {
  const seed = getAppHookGeneratorSeed(input);
  const variationOffset = input.variationIndex * 7;
  const safeCount =
    input.edgeLevel === "safe" ? 8 : input.edgeLevel === "punchy" ? 4 : 2;
  const punchyCount =
    input.edgeLevel === "safe" ? 0 : input.edgeLevel === "punchy" ? 4 : 2;
  const boldCount = input.edgeLevel === "bold" ? 4 : 0;
  const safeOffset =
    (seed + variationOffset) % curatedAppHookTemplateIds.safe.length;
  const punchyOffset =
    (seed + variationOffset + 3) % curatedAppHookTemplateIds.punchy.length;
  const boldOffset =
    (seed + variationOffset + 5) % curatedAppHookTemplateIds.bold.length;

  return [
    ...Array.from(
      { length: safeCount },
      (_, index) =>
        curatedAppHookTemplateIds.safe[
          (safeOffset + index) % curatedAppHookTemplateIds.safe.length
        ],
    ),
    ...Array.from(
      { length: punchyCount },
      (_, index) =>
        curatedAppHookTemplateIds.punchy[
          (punchyOffset + index) % curatedAppHookTemplateIds.punchy.length
        ],
    ),
    ...Array.from(
      { length: boldCount },
      (_, index) =>
        curatedAppHookTemplateIds.bold[
          (boldOffset + index) % curatedAppHookTemplateIds.bold.length
        ],
    ),
  ];
}
