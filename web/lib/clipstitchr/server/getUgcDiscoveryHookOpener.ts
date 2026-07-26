import { ugcDiscoveryHookOpenerFamilies } from "@/lib/clipstitchr/resources/clipr/ugcDiscoveryHookOpenerFamilies";
import { getUgcDiscoveryHookCoordinates } from "@/lib/clipstitchr/server/getUgcDiscoveryHookCoordinates";

export function getUgcDiscoveryHookOpener(templateId: string) {
  const coordinates = getUgcDiscoveryHookCoordinates(templateId);

  return coordinates
    ? (ugcDiscoveryHookOpenerFamilies[coordinates.familyIndex]?.[
        coordinates.openerIndex
      ] ?? "")
    : "";
}
