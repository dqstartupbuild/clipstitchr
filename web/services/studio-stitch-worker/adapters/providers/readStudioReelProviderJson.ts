import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelProviderBytes } from "./readStudioReelProviderBytes";

export async function readStudioReelProviderJson(
  response: Response,
  providerName: string,
  maximumBytes?: number,
) {
  const bytes = await readStudioReelProviderBytes(
    response,
    providerName,
    maximumBytes,
  );
  let value: unknown;
  try {
    value = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
  } catch {
    throw new StudioReelWorkerError({
      code: "INVALID_PROVIDER_JSON",
      kind: "permanent",
      publicMessage: `${providerName} returned an invalid response.`,
    });
  }
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new StudioReelWorkerError({
      code: "INVALID_PROVIDER_JSON",
      kind: "permanent",
      publicMessage: `${providerName} returned an invalid response.`,
    });
  }
  return value as Record<string, unknown>;
}
