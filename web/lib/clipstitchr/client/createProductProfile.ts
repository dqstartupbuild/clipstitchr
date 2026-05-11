"use client";

import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type CreateProductProfileResponse = {
  message?: string;
  product?: ProductProfile;
};

export async function createProductProfile(input: ProductProfileCreateInput) {
  const response = await fetch("/api/settings/products", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as CreateProductProfileResponse;

  if (!response.ok || !body.product) {
    throw new Error(body.message ?? "Unable to save this product.");
  }

  return body.product;
}
