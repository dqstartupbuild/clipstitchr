import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateArtifactFormat } from "@/lib/clipstitchr/tools/catalog/PublicToolGateArtifactFormat";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export function hasPublicToolPortabilityArtifactFormat(
  toolKey: PublicToolKey,
  format: PublicToolGateArtifactFormat,
) {
  const metadata = getPublicToolGateMetadata(toolKey);

  return (
    metadata.mode === "gated-portability" &&
    metadata.artifact.format === format
  );
}
