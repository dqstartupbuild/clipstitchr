import { cliprHookStyleOptions } from "@/lib/clipstitchr/resources/clipr/cliprHookStyleOptions";
import { normalizeProductWebsiteUrl } from "@/lib/clipstitchr/server/normalizeProductWebsiteUrl";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

const cliprHookStyleKeys = new Set<string>(
  cliprHookStyleOptions.map((option) => option.value),
);

function normalizeProductDetails(value: unknown) {
  return typeof value === "string"
    ? stripWebsiteSourcedProductDetails(value)
    : "";
}

function readPreferredCliprHookStyleKey(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const styleKey = value.trim();

  return cliprHookStyleKeys.has(styleKey) ? styleKey : undefined;
}

export function readProductProfileInput(
  body: unknown,
): ProductProfileCreateInput {
  const source =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const preferredCliprHookStyleKey = readPreferredCliprHookStyleKey(
    source.preferredCliprHookStyleKey,
  );
  const websiteUrl = normalizeProductWebsiteUrl(source.websiteUrl);
  const emotionalNarrative =
    typeof source.emotionalNarrative === "string"
      ? source.emotionalNarrative.trim()
      : "";
  const input = {
    name: typeof source.name === "string" ? source.name.trim() : "",
    productDetails: normalizeProductDetails(source.productDetails),
    audienceDetails:
      typeof source.audienceDetails === "string"
        ? source.audienceDetails.trim()
        : "",
    ...(emotionalNarrative ? { emotionalNarrative } : {}),
    ...(websiteUrl ? { websiteUrl } : {}),
    ...(preferredCliprHookStyleKey ? { preferredCliprHookStyleKey } : {}),
  };

  if (!input.name) {
    throw new Error("Product name is required.");
  }

  return input;
}
