import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

type SearchPexelsPhotosOptions = {
  query: string;
  perPage?: number;
};

export async function searchPexelsPhotos({
  perPage = 12,
  query,
}: SearchPexelsPhotosOptions) {
  const response = await fetch("/api/swipr/pexels/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ perPage, query }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to search Pexels.");
  }

  return ((await response.json()) as { photos: PexelsPhotoResult[] }).photos;
}
