import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";
import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";

const studioBetaR2ObjectKinds = new Set<StudioBetaR2ObjectKind>([
  "research-artifact",
  "media-source",
  "project",
  "media-output",
  "poster",
  "caption",
  "font",
]);

export function assertStudioBetaR2ObjectKeyBelongsToProduct(
  key: string,
  userId: string,
  productId: string,
) {
  const studioPrefix = `${createUserR2KeyPrefix(userId)}studio/v1/`;
  const relativeSegments = key.slice(studioPrefix.length).split("/");
  const kind = relativeSegments[0] as StudioBetaR2ObjectKind | undefined;

  if (
    !kind ||
    !studioBetaR2ObjectKinds.has(kind) ||
    relativeSegments[1] !== productId ||
    relativeSegments.length < 4 ||
    relativeSegments.some((segment) => segment.length === 0)
  ) {
    throw new Error("That Studio file belongs to another Product.");
  }
}
