import { cliprHookStyleOptions } from "@/lib/clipstitchr/resources/clipr/cliprHookStyleOptions";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

const cliprHookStyleKeys = new Set<string>(
  cliprHookStyleOptions.map((option) => option.value),
);

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
  const input = {
    name: typeof source.name === "string" ? source.name.trim() : "",
    productDetails:
      typeof source.productDetails === "string"
        ? source.productDetails.trim()
        : "",
    audienceDetails:
      typeof source.audienceDetails === "string"
        ? source.audienceDetails.trim()
        : "",
    ...(preferredCliprHookStyleKey ? { preferredCliprHookStyleKey } : {}),
  };

  if (!input.name) {
    throw new Error("Product name is required.");
  }

  return input;
}
