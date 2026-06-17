type GenerateSwiprDraftsOptions = {
  count: number;
  productId: string;
  selectedLibraryQueries: string[];
  slideCount: number;
};

export async function generateSwiprDrafts({
  count,
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
      count,
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
