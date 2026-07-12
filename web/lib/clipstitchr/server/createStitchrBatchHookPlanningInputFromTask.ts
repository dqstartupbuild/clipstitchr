import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrBatchHookPlanningInput } from "@/lib/clipstitchr/types/StitchrBatchHookPlanningInput";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import { readHookLabTextBlueprints } from "@/lib/clipstitchr/server/readHookLabTextBlueprints";

type StitchrBatchTaskSnapshot = {
  id: string;
  inputSnapshotJson: string;
  runId: string;
};

function getObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(value: unknown) {
  const text = getString(value);

  return text || undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getStringArrayRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      getStringArray(item),
    ]),
  );
}

function createFallbackProduct(input: {
  demoClipName: string;
  productName?: string;
  ugcClipName: string;
}): ProductProfile {
  const createdAt = new Date().toISOString();
  const name = input.productName || input.demoClipName;

  return {
    id: "stitchr-batch-hook-context",
    name,
    productDetails: `A short-form ad edit using UGC clip "${input.ugcClipName}" followed by demo clip "${input.demoClipName}".`,
    audienceDetails: "Short-form viewers who need a reason to keep watching.",
    inferredPainPoints: ["low retention", "unclear product value"],
    createdAt,
    updatedAt: createdAt,
  };
}

function createProduct(input: Record<string, unknown>): ProductProfile {
  const ugcClipName = getString(input.ugcClipName) || "UGC clip";
  const demoClipName = getString(input.demoClipName) || "Demo clip";
  const productName = getOptionalString(input.productName);
  const fallbackProduct = createFallbackProduct({
    demoClipName,
    productName,
    ugcClipName,
  });

  if (!productName) {
    return fallbackProduct;
  }

  return {
    id: getOptionalString(input.productId) ?? fallbackProduct.id,
    name: productName,
    productDetails: stripWebsiteSourcedProductDetails(
      getOptionalString(input.productDetails) ?? fallbackProduct.productDetails,
    ),
    audienceDetails:
      getOptionalString(input.audienceDetails) ??
      fallbackProduct.audienceDetails,
    emotionalNarrative: getOptionalString(input.emotionalNarrative),
    cliprPlaceholderFillers: getStringArrayRecord(input.cliprPlaceholderFillers),
    eligibleCliprHookStyleKeys: getStringArray(input.eligibleCliprHookStyleKeys),
    eligibleCliprHookTemplateIds: getStringArray(
      input.eligibleCliprHookTemplateIds,
    ),
    hookEdgeLevel: getOptionalString(
      input.hookEdgeLevel,
    ) as ProductProfile["hookEdgeLevel"],
    hookGenerationGoal: getOptionalString(
      input.hookGenerationGoal,
    ) as ProductProfile["hookGenerationGoal"],
    hookLabTextBlueprints: readHookLabTextBlueprints(
      input.hookLabTextBlueprints,
    ),
    inferredProblem: getOptionalString(input.inferredProblem),
    inferredPainPoints: getStringArray(input.inferredPainPoints),
    preferredCliprHookStyleKey: getOptionalString(
      input.preferredCliprHookStyleKey,
    ),
    rejectedHookExamples: getStringArray(input.rejectedHookExamples),
    winningHookExamples: getStringArray(input.winningHookExamples),
    createdAt: getOptionalString(input.productCreatedAt) ?? "",
    updatedAt: getOptionalString(input.productUpdatedAt) ?? "",
  };
}

function getLibraryKind(value: unknown) {
  return value === "clipr" ||
    value === "demo" ||
    value === "swapr" ||
    value === "ugc"
    ? value
    : undefined;
}

function createClipContext(
  input: Record<string, unknown>,
  role: "demo" | "ugc",
): StitchrTextGenerationClipContext {
  const prefix = role === "ugc" ? "ugc" : "demo";

  return {
    id: getString(input[`${prefix}ClipId`]),
    libraryKind: getLibraryKind(input[`${prefix}LibraryKind`]),
    locationDescription: getOptionalString(
      input[`${prefix}LocationDescription`],
    ),
    mainPersonDescription: getOptionalString(
      input[`${prefix}MainPersonDescription`],
    ),
    name: getString(input[`${prefix}ClipName`]),
    outfitDescription: getOptionalString(input[`${prefix}OutfitDescription`]),
    poseDescription: getOptionalString(input[`${prefix}PoseDescription`]),
    productDescription: getOptionalString(input[`${prefix}ProductDescription`]),
    quickEditOverlayTextHint: getOptionalString(
      input[`${prefix}QuickEditOverlayTextHint`],
    ),
    quickEditOverlayTextReason: getOptionalString(
      input[`${prefix}QuickEditOverlayTextReason`],
    ),
    role,
    tags: getStringArray(input[`${prefix}Tags`]),
    videoDescription: getOptionalString(input[`${prefix}VideoDescription`]),
  };
}

export function createStitchrBatchHookPlanningInputFromTask(
  task: StitchrBatchTaskSnapshot,
): StitchrBatchHookPlanningInput {
  const input = getObject(JSON.parse(task.inputSnapshotJson) as unknown);

  return {
    automationRunId: task.runId,
    automationTaskId: task.id,
    demoClipId: getString(input.demoClipId),
    demoClipName: getString(input.demoClipName),
    hasTemplateTextOverlay: Boolean(input.templateTextOverlay),
    product: createProduct(input),
    stitchrClipContexts: [
      createClipContext(input, "ugc"),
      createClipContext(input, "demo"),
    ],
    ugcClipId: getString(input.ugcClipId),
    ugcClipName: getString(input.ugcClipName),
  };
}
