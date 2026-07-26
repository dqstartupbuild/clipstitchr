import { getUgcDiscoveryHookCoordinates } from "@/lib/clipstitchr/server/getUgcDiscoveryHookCoordinates";
import { getUgcDiscoveryHookOpener } from "@/lib/clipstitchr/server/getUgcDiscoveryHookOpener";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";

const fallbackSuffixFamilies = [
  [
    "realizing guessing was making the next step harder",
    "finding out I did not need another restart",
    "making the starting point harder than it needed to be",
    "realizing guessing was never a real plan",
    "finding out the next step can actually feel clear",
    "making this way more complicated than it needed to be",
    "learning that progress did not need another restart",
    "thinking I made the starting point harder than it needed to be",
    "only now realizing guessing was the hard part",
    "finding out the next step could feel this clear",
  ],
  [
    "I did not need another restart after all",
    "progress did not need a perfect setup",
    "the next step could have been this clear",
    "guessing was the part making this harder",
    "I just needed a clearer next step",
    "the starting point could feel this simple",
    "guessing was the part making this harder",
    "the next step could have been this clear",
    "I did not need another restart",
    "I made the starting point way too complicated",
  ],
  [
    "progress to feel much harder than this",
    "the next step had to feel complicated",
    "guessing was the only way to start",
    "progress has to feel confusing at first",
    "another restart would finally make things clear",
    "the next step had to feel complicated",
    "guessing was just part of making progress",
    "the starting point had to be the hardest part",
    "progress needed another restart to make sense",
    "the next step had to feel this complicated",
  ],
] as const;

export function createStitchrAssignedOpenerFallbackHook(
  template: CliprHookTemplate,
) {
  const coordinates = getUgcDiscoveryHookCoordinates(template.id);

  if (!coordinates || template.source !== "ugc_discovery_patterns") {
    return "";
  }

  const opener = getUgcDiscoveryHookOpener(template.id);
  const suffix =
    fallbackSuffixFamilies[coordinates.familyIndex]?.[coordinates.openerIndex];

  return opener && suffix ? `${opener} ${suffix}` : "";
}
