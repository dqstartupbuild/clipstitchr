import type { PexelsSearchResult } from "@/lib/clipstitchr/types/PexelsSearchResult";

type SearchPexelsPhotosOptions = {
  page?: number;
  perPage?: number;
  query: string;
};

export async function searchPexelsPhotos({
  page = 1,
  perPage = 12,
  query,
}: SearchPexelsPhotosOptions) {
  const response = await fetch("/api/swipr/pexels/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ page, perPage, query }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to search Pexels.");
  }

  return (await response.json()) as PexelsSearchResult;
}
