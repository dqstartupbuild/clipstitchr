import { createStitchrAssignedOpenerFallbackHook } from "@/lib/clipstitchr/server/createStitchrAssignedOpenerFallbackHook";
import { getStitchrHookTextIsUsable } from "@/lib/clipstitchr/server/getStitchrHookTextIsUsable";
import { getStitchrHookVariationIndex } from "@/lib/clipstitchr/server/getStitchrHookVariationIndex";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getSeededIndex } from "@/lib/clipstitchr/utils/getSeededIndex";
import { sanitizeGeneratedShortFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedShortFormText";

const safeFallbackHooks = [
  "me realizing random effort was never a real plan",
  "wait, so I did not need another restart",
  "I thought more effort would finally make sense",
  "the way I kept confusing effort with direction",
  "okay, apparently I just needed a clearer next step",
  "why did nobody tell me starting could feel this clear",
  "somehow I made the starting point the hardest part",
  "turns out guessing was the part holding me back",
  "POV: you finally stop guessing what comes next",
  "I was making the next step way too complicated",
];

export function createStitchrFallbackHook({
  candidates,
  product,
  variationSeed,
}: {
  candidates: CliprHookTemplate[];
  product: ProductProfile;
  variationSeed?: string;
}) {
  const resolvedVariationSeed =
    variationSeed?.trim() || `${product.id}:stitchr-fallback`;
  const assignedCandidate = candidates[0];

  if (assignedCandidate) {
    let unresolvedPlaceholder = false;
    const filledTemplate = assignedCandidate.template.replace(
      /{{\s*([a-z0-9_]+)\s*}}/gi,
      (_placeholder, variable: string) => {
        const savedValues =
          product.cliprPlaceholderFillers?.[variable]?.filter((value) =>
            Boolean(value.trim()),
          ) ?? [];

        if (savedValues.length === 0) {
          unresolvedPlaceholder = true;
          return "";
        }

        return (
          savedValues[
            getSeededIndex(
              `${resolvedVariationSeed}:${assignedCandidate.id}:${variable}`,
              savedValues.length,
            )
          ] ?? ""
        );
      },
    );
    const hook = sanitizeGeneratedShortFormText({
      fallback: "",
      maxLength: 140,
      text: filledTemplate,
    });

    if (
      !unresolvedPlaceholder &&
      !/{{|}}/.test(hook) &&
      getStitchrHookTextIsUsable(hook)
    ) {
      return hook;
    }

    const assignedOpenerFallback =
      createStitchrAssignedOpenerFallbackHook(assignedCandidate);

    if (getStitchrHookTextIsUsable(assignedOpenerFallback)) {
      return assignedOpenerFallback;
    }
  }

  return (
    safeFallbackHooks[
      getStitchrHookVariationIndex(resolvedVariationSeed) %
        safeFallbackHooks.length
    ] ?? safeFallbackHooks[0]
  );
}
