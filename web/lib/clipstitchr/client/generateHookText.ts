import type { HookGenerationPurpose } from "@/lib/clipstitchr/types/HookGenerationPurpose";
import type { HookGenerationResult } from "@/lib/clipstitchr/types/HookGenerationResult";

type GenerateHookTextOptions = {
  productId: string;
  purpose: HookGenerationPurpose;
  slideCount?: number;
};

type HookGenerationResponse = HookGenerationResult & {
  message?: string;
};

export async function generateHookText({
  productId,
  purpose,
  slideCount,
}: GenerateHookTextOptions) {
  const response = await fetch("/api/hooks/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      purpose,
      slideCount,
    }),
  });
  const body = (await response.json()) as HookGenerationResponse;

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to generate text.");
  }

  return body;
}
