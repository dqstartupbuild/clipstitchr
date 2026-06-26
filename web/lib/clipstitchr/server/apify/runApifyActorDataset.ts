import { createApifyActorDatasetUrl } from "@/lib/clipstitchr/server/apify/createApifyActorDatasetUrl";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";

type RunApifyActorDatasetOptions = {
  actorId: string;
  input: Record<string, unknown>;
  timeoutMs?: number;
};

export async function runApifyActorDataset({
  actorId,
  input,
  timeoutMs = 120000,
}: RunApifyActorDatasetOptions) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      createApifyActorDatasetUrl(actorId, getApifyApiToken()),
      {
        body: JSON.stringify(input),
        headers: { "content-type": "application/json" },
        method: "POST",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error("Unable to find TikTok sounds right now.");
    }

    const items = (await response.json()) as unknown;

    return Array.isArray(items) ? items : [];
  } finally {
    clearTimeout(timeout);
  }
}
