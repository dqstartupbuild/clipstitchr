import type { HookLibraryQuery } from "@/lib/clipstitchr/types/HookLibraryQuery";
import type { HookLibraryResponse } from "@/lib/clipstitchr/types/HookLibraryResponse";

export async function fetchHookLibraryTemplates(
  query: HookLibraryQuery,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams({ page: String(query.page) });

  if (query.category) searchParams.set("category", query.category);
  if (query.purpose) searchParams.set("purpose", query.purpose);
  if (query.query) searchParams.set("q", query.query);
  if (query.risk) searchParams.set("risk", query.risk);
  if (query.trigger) searchParams.set("trigger", query.trigger);

  const response = await fetch(
    `/api/hook-lab/templates?${searchParams.toString()}`,
    { signal },
  );
  const payload = (await response.json().catch(() => ({}))) as
    | HookLibraryResponse
    | { message?: string };

  if (!response.ok || !("items" in payload)) {
    throw new Error(
      "message" in payload && payload.message
        ? payload.message
        : "Unable to load the hook library.",
    );
  }

  return payload;
}
