import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createLocalVideoInputDisposer } from "@/lib/clipstitchr/tools/localVideoInspection/createLocalVideoInputDisposer";
import { getLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/getLocalVideoInspection";

export async function readLocalVideoInspection(
  file: File,
  signal?: AbortSignal,
) {
  const input = createMediaInput(file);
  const disposeInput = createLocalVideoInputDisposer(input);

  if (signal?.aborted) {
    disposeInput();
    const error = new Error("Video inspection was canceled.");
    error.name = "AbortError";
    throw error;
  }

  signal?.addEventListener("abort", disposeInput, { once: true });

  try {
    const inspection = await getLocalVideoInspection(input, file);

    if (signal?.aborted) {
      const error = new Error("Video inspection was canceled.");
      error.name = "AbortError";
      throw error;
    }

    return inspection;
  } finally {
    signal?.removeEventListener("abort", disposeInput);
    disposeInput();
  }
}
