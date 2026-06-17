import { getPexelsApiKey } from "@/lib/clipstitchr/server/pexels/getPexelsApiKey";
import { parsePexelsSearchResponse } from "@/lib/clipstitchr/server/pexels/parsePexelsSearchResponse";

type SearchPexelsPhotoResultsOptions = {
  page?: number;
  perPage: number;
  query: string;
};

export async function searchPexelsPhotoResults({
  page = 1,
  perPage,
  query,
}: SearchPexelsPhotoResultsOptions) {
  const url = new URL("https://api.pexels.com/v1/search");

  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const response = await fetch(url, {
    headers: {
      Authorization: getPexelsApiKey(),
    },
  });

  if (!response.ok) {
    throw new Error("Unable to search Pexels right now.");
  }

  return parsePexelsSearchResponse(await response.json());
}
