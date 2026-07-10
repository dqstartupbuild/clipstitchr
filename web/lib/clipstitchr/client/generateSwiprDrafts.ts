import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type GenerateSwiprDraftsOptions = {
  callToActionStyle: SwiprCallToActionStyle;
  count: number;
  creativeContext: string;
  productId: string;
  selectedLibraryQueries: string[];
  slideCount: number;
};

export async function generateSwiprDrafts({
  callToActionStyle,
  count,
  creativeContext,
  productId,
  selectedLibraryQueries,
  slideCount,
}: GenerateSwiprDraftsOptions) {
  const response = await fetch("/api/swipr/drafts/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      callToActionStyle,
      count,
      creativeContext,
      productId,
      selectedLibraryQueries,
      slideCount,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate draft Swipes.");
  }

  return (await response.json()) as {
    count: number;
    ids: string[];
    providerModel: string;
    providerPredictionId: string;
  };
}
