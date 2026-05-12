"use client";

import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type UpdateProductProfileResponse = {
  message?: string;
  product?: ProductProfile;
};

export async function updateProductProfile(
  id: string,
  input: ProductProfileCreateInput,
) {
  const response = await fetch(`/api/settings/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as UpdateProductProfileResponse;

  if (!response.ok || !body.product) {
    throw new Error(body.message ?? "Unable to update this product.");
  }

  return body.product;
}
