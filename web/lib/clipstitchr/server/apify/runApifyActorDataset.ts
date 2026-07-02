import { createApifyActorDatasetUrl } from "@/lib/clipstitchr/server/apify/createApifyActorDatasetUrl";
import { getApifyApiToken } from "@/lib/clipstitchr/server/apify/getApifyApiToken";

type RunApifyActorDatasetOptions = {
  actorId: string;
  errorMessage?: string;
  input: Record<string, unknown>;
  timeoutMs?: number;
};

export async function runApifyActorDataset({
  actorId,
  errorMessage = "Unable to use Apify right now.",
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
      throw new Error(errorMessage);
    }

    const items = (await response.json()) as unknown;

    return Array.isArray(items) ? items : [];
  } finally {
    clearTimeout(timeout);
  }
}
