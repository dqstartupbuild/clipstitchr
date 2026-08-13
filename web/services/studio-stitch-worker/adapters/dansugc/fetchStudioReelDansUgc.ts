import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export async function fetchStudioReelDansUgc(input: {
  readonly apiKey: string;
  readonly fetch?: typeof fetch;
  readonly init?: RequestInit;
  readonly outcomeUnknownOnFailure?: boolean;
  readonly path: string;
  readonly search?: URLSearchParams;
  readonly timeoutMs?: number;
}) {
  if (!/^dsk_[A-Za-z0-9_-]{4,}$/u.test(input.apiKey)) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_CONFIGURATION_INVALID",
      kind: "permanent",
      publicMessage: "DanSUGC is not configured for Studio Stitch.",
    });
  }
  if (!/^\/broll(?:\/purchase|\/purchases)?$/u.test(input.path)) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_PATH_INVALID",
      kind: "permanent",
      publicMessage: "The DanSUGC operation is not supported.",
    });
  }
  const url = new URL(`/api/v1${input.path}`, "https://dansugc.com");
  if (input.search) url.search = input.search.toString();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? 30_000,
  );
  try {
    return await (input.fetch ?? fetch)(url, {
      ...input.init,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${input.apiKey}`,
        ...input.init?.headers,
      },
      redirect: "error",
      signal: controller.signal,
    });
  } catch (error) {
    throw new StudioReelWorkerError({
      cause: error,
      code: input.outcomeUnknownOnFailure
        ? "DANSUGC_OUTCOME_UNKNOWN"
        : "DANSUGC_UNAVAILABLE",
      kind: input.outcomeUnknownOnFailure ? "uncertain" : "retryable",
      publicMessage: input.outcomeUnknownOnFailure
        ? "DanSUGC purchase acceptance could not be confirmed."
        : "DanSUGC is temporarily unavailable.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
