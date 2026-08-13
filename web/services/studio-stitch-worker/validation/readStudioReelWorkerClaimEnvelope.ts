import type { StudioReelWorkerClaimEnvelope } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import { parseStudioStitchRecipe } from "../../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import { STUDIO_REEL_WORKER_CONTRACT_VERSION } from "../constants/studioReelWorkerContractVersion";
import { STUDIO_REEL_WORKER_LIMITS } from "../constants/studioReelWorkerLimits";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { getStudioReelAssetIdentity } from "../security/getStudioReelAssetIdentity";
import { isStudioReelWorkerIdentifier } from "./isStudioReelWorkerIdentifier";
import { isStudioReelWorkerRecord } from "./isStudioReelWorkerRecord";
import { readStudioReelWorkerAssetManifest } from "./readStudioReelWorkerAssetManifest";

export function readStudioReelWorkerClaimEnvelope(
  value: unknown,
): StudioReelWorkerClaimEnvelope {
  if (!isStudioReelWorkerRecord(value)) {
    throw new StudioReelWorkerError({
      code: "INVALID_CLAIM",
      kind: "permanent",
      publicMessage: "The Studio Stitch claim is invalid.",
    });
  }
  if (
    value.schemaVersion !== STUDIO_REEL_WORKER_CONTRACT_VERSION ||
    !isStudioReelWorkerIdentifier(value.ownerId) ||
    !isStudioReelWorkerIdentifier(value.productId) ||
    !isStudioReelWorkerIdentifier(value.runId) ||
    !isStudioReelWorkerIdentifier(value.leaseId) ||
    !Number.isInteger(value.runAttempt) ||
    Number(value.runAttempt) < 1 ||
    !Number.isInteger(value.leaseAttempt) ||
    Number(value.leaseAttempt) < 1 ||
    typeof value.leaseExpiresAt !== "string" ||
    !Number.isFinite(Date.parse(value.leaseExpiresAt)) ||
    typeof value.requestedAt !== "string" ||
    !Number.isFinite(Date.parse(value.requestedAt)) ||
    !Array.isArray(value.recipes) ||
    value.recipes.length < 1 ||
    value.recipes.length > 20
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_CLAIM",
      kind: "permanent",
      publicMessage: "The Studio Stitch claim is invalid.",
    });
  }
  const recipeIds = new Set<string>();
  for (const candidate of value.recipes) {
    if (
      !isStudioReelWorkerRecord(candidate) ||
      !isStudioReelWorkerIdentifier(candidate.id) ||
      !["classicReel", "talkingVideo"].includes(String(candidate.pipeline)) ||
      typeof candidate.recipeJson !== "string" ||
      !Array.isArray(candidate.assets)
    ) {
      throw new StudioReelWorkerError({
        code: "INVALID_CLAIM_RECIPE",
        kind: "permanent",
        publicMessage: "A Studio Stitch claimed recipe is invalid.",
      });
    }
    const recipe = parseStudioStitchRecipe(candidate.recipeJson);
    if (
      recipe.id !== candidate.id ||
      recipe.productId !== value.productId ||
      recipe.pipeline !== candidate.pipeline ||
      recipeIds.has(recipe.id)
    ) {
      throw new StudioReelWorkerError({
        code: "CLAIM_RECIPE_SCOPE_INVALID",
        kind: "permanent",
        publicMessage: "A Studio Stitch recipe is outside the claimed run.",
      });
    }
    recipeIds.add(recipe.id);
    const manifests = candidate.assets.map((asset) =>
      readStudioReelWorkerAssetManifest(asset, value.ownerId as string),
    );
    const manifestIds = new Set(
      manifests.map(({ source }) => getStudioReelAssetIdentity(source)),
    );
    const reactionFromProvider = recipe.providerRequirements.some(
      (requirement) =>
        requirement.capability === "reactionFootage" &&
        !requirement.satisfiedByInput,
    );
    const reactionRoles = new Set([
      "reactionHook",
      "reactionContext",
      "reactionBridge",
      "reactionSupport",
      "ctaReaction",
    ]);
    const required = [
      ...recipe.segments
        .filter(
          (segment) =>
            !reactionFromProvider || !reactionRoles.has(segment.role),
        )
        .map(({ source }) => source),
      ...(recipe.music.source ? [recipe.music.source] : []),
    ];
    if (
      manifestIds.size !== manifests.length ||
      required.some(
        (source) => !manifestIds.has(getStudioReelAssetIdentity(source)),
      )
    ) {
      throw new StudioReelWorkerError({
        code: "CLAIM_ASSET_COVERAGE_INVALID",
        kind: "permanent",
        publicMessage: "Studio Stitch claim assets do not cover the frozen recipe.",
      });
    }
  }
  if (value.resume !== undefined) {
    if (
      !isStudioReelWorkerRecord(value.resume) ||
      !Number.isInteger(value.resume.revision) ||
      Number(value.resume.revision) < 1 ||
      !Number.isInteger(value.resume.recipeIndex) ||
      Number(value.resume.recipeIndex) < 0 ||
      Number(value.resume.recipeIndex) >= value.recipes.length ||
      typeof value.resume.snapshotJson !== "string" ||
      new TextEncoder().encode(value.resume.snapshotJson).byteLength >
        STUDIO_REEL_WORKER_LIMITS.checkpointBytes
    ) {
      throw new StudioReelWorkerError({
        code: "INVALID_CLAIM_RESUME",
        kind: "permanent",
        publicMessage: "The Studio Stitch resume pointer is invalid.",
      });
    }
  }
  return value as unknown as StudioReelWorkerClaimEnvelope;
}
