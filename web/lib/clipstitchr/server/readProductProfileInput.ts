import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function readProductProfileInput(
  body: unknown,
): ProductProfileCreateInput {
  const source =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
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
  };

  if (!input.name) {
    throw new Error("Product name is required.");
  }

  return input;
}
