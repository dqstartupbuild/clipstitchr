import { createStitchrFallbackHook } from "@/lib/clipstitchr/server/createStitchrFallbackHook";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createStitchrFallbackGenerationOutputText({
  candidates,
  product,
  variationSeed,
}: {
  candidates: CliprHookTemplate[];
  product: ProductProfile;
  variationSeed?: string;
}) {
  const templateId = candidates[0]?.id ?? "";
  const hook = createStitchrFallbackHook({
    candidates,
    product,
    variationSeed,
  });
  const caption = "I was making the first step harder than it needed to be.";

  return JSON.stringify({
    caption,
    filledHook: hook,
    hashtags: [],
    hookOptions: [
      {
        angle: "Best grounded fallback",
        caption,
        templateId,
        text: hook,
      },
    ],
    overlayText: hook,
    scenePlan: [],
    script: "",
    slides: [hook],
    templateId,
    variablesUsed: {},
  });
}
