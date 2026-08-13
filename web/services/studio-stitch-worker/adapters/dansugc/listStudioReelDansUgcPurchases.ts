import { readStudioReelProviderJson } from "../providers/readStudioReelProviderJson";
import { fetchStudioReelDansUgc } from "./fetchStudioReelDansUgc";
import { readStudioReelDansUgcPurchases } from "./readStudioReelDansUgcPurchases";

export async function listStudioReelDansUgcPurchases(input: {
  readonly apiKey: string;
  readonly fetch?: typeof fetch;
}) {
  const response = await fetchStudioReelDansUgc({
    apiKey: input.apiKey,
    fetch: input.fetch,
    path: "/broll/purchases",
    search: new URLSearchParams({ limit: "500", page: "1" }),
  });
  return readStudioReelDansUgcPurchases(
    await readStudioReelProviderJson(response, "DanSUGC", 4 * 1024 * 1024),
  );
}
