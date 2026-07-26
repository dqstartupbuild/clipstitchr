import { ugcDiscoveryHookOpenerFamilies } from "@/lib/clipstitchr/resources/clipr/ugcDiscoveryHookOpenerFamilies";
import { getUgcDiscoveryHookOpener } from "@/lib/clipstitchr/server/getUgcDiscoveryHookOpener";
import { normalizeStitchrHookOpenerText } from "@/lib/clipstitchr/server/normalizeStitchrHookOpenerText";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";

const normalizedUgcDiscoveryHookOpeners = ugcDiscoveryHookOpenerFamilies
  .flatMap((family) =>
    family.map((opener) => normalizeStitchrHookOpenerText(opener)),
  )
  .sort((left, right) => right.length - left.length);

export function getStitchrHookMatchesAssignedOpener({
  hook,
  template,
}: {
  hook: string;
  template: CliprHookTemplate | undefined;
}) {
  if (!template || template.source !== "ugc_discovery_patterns") {
    return true;
  }

  const assignedOpener = normalizeStitchrHookOpenerText(
    getUgcDiscoveryHookOpener(template.id),
  );
  const normalizedHook = normalizeStitchrHookOpenerText(hook);
  const detectedOpener = normalizedUgcDiscoveryHookOpeners.find(
    (opener) =>
      normalizedHook === opener || normalizedHook.startsWith(`${opener} `),
  );

  return Boolean(assignedOpener && detectedOpener === assignedOpener);
}
