import type { LazyReelMakeBriefData } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefData";
import type { LazyReelMakeBriefMode } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefMode";
import { fillLazyReelHook } from "./fillLazyReelHook";
import { getLazyReelBreakoutChecklist } from "./getLazyReelBreakoutChecklist";
import { getLazyReelProductCategory } from "./getLazyReelProductCategory";
import { hashLazyReelInput } from "./hashLazyReelInput";
import { lazyReelAngles } from "./lazyReelAngles";
import { lazyReelAwareness } from "./lazyReelAwareness";
import { lazyReelHookPatterns } from "./lazyReelHookPatterns";
import { lazyReelScriptFrameworks } from "./lazyReelScriptFrameworks";
import { lazyReelVisualApproaches } from "./lazyReelVisualApproaches";
import { pickLazyReelValue } from "./pickLazyReelValue";
import { rotateLazyReelValues } from "./rotateLazyReelValues";

export function createLazyReelBriefData(input: {
  audience: string;
  count: number;
  framework?: string;
  mode: LazyReelMakeBriefMode;
  niche: string;
  objective: string;
  product: string;
}): LazyReelMakeBriefData {
  const seed = hashLazyReelInput(`${input.product}${input.niche}${input.audience}${input.objective}`);
  const category = getLazyReelProductCategory(input.product);
  const selectedFramework =
    lazyReelScriptFrameworks.find(
      (item) =>
        item.id === input.framework || item.name.toLocaleLowerCase() === input.framework?.toLocaleLowerCase(),
    ) ?? pickLazyReelValue(lazyReelScriptFrameworks, seed);
  const angle = pickLazyReelValue(lazyReelAngles, seed);
  const patterns = rotateLazyReelValues(lazyReelHookPatterns, seed, input.count);
  const hooks = patterns.map((pattern, index) => ({
    delivery: pickLazyReelValue(
      [
        "phone-mirror check",
        "post-workout reaction",
        "frustrated close-up, then relief",
        "talk to camera while holding the product",
        "split-screen against the old way",
      ],
      seed,
      index,
    ),
    pattern: pattern.name,
    text: fillLazyReelHook(pattern.template, {
      audience: input.audience,
      category,
      niche: input.niche,
      product: input.product,
    }),
  }));
  const brollOptions = [
    "handheld talk to camera",
    "product close-up in natural light",
    "the stuck state before the switch",
    "the result with no narration",
    "selfie-arm walk and talk",
  ] as const;
  const beats = selectedFramework.beats.map((beat, index) => ({
    beat,
    broll: pickLazyReelValue(brollOptions, seed + 1, index),
    onScreenText: beat.split(/[(–-]/u)[0].trim().toLocaleUpperCase().slice(0, 28),
    voiceover: pickLazyReelValue(
      [
        `Honestly? ${beat.toLocaleLowerCase()}.`,
        `Okay, so: ${beat.toLocaleLowerCase()}.`,
        `Here is the thing about ${beat.toLocaleLowerCase()}.`,
        `No one tells you: ${beat.toLocaleLowerCase()}.`,
      ],
      seed,
      index,
    ),
  }));
  const conceptFrameworks = rotateLazyReelValues(
    lazyReelScriptFrameworks,
    seed,
    input.count,
  );
  const conceptPatterns = rotateLazyReelValues(
    lazyReelHookPatterns,
    seed + 3,
    input.count,
  );
  const concepts = conceptFrameworks.map((framework, index) => ({
    awareness: pickLazyReelValue(lazyReelAwareness, seed, index).name,
    framework: `${framework.name} (${framework.acronym})`,
    hook: fillLazyReelHook(conceptPatterns[index].template, {
      audience: input.audience,
      category,
      niche: input.niche,
      product: input.product,
    }),
    structure: [...framework.beats],
    visualApproach: pickLazyReelValue(lazyReelVisualApproaches, seed + 1, index),
  }));

  return {
    angle: input.mode === "brief" ? { ...angle } : null,
    audience: input.audience,
    beats: input.mode === "brief" ? beats : [],
    breakoutChecklist: getLazyReelBreakoutChecklist(),
    concepts: input.mode === "ideas" ? concepts : [],
    framework:
      input.mode === "brief"
        ? {
            acronym: selectedFramework.acronym,
            id: selectedFramework.id,
            name: selectedFramework.name,
          }
        : null,
    hooks: input.mode === "ideas" ? [] : hooks,
    mode: input.mode,
    objective: input.objective,
    product: input.product,
  };
}
