import { waitForSocialPublishingMediaAvailabilityRetry } from "@/lib/clipstitchr/server/socialPublishing/waitForSocialPublishingMediaAvailabilityRetry";

export async function waitForSocialPublishingMediaAvailability(
  publicUrl: string,
) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(publicUrl, {
        cache: "no-store",
        headers: {
          Range: "bytes=0-0",
        },
        signal: AbortSignal.timeout(2000),
      });

      await response.body?.cancel().catch(() => undefined);

      if (response.ok) {
        return;
      }
    } catch {
      // The public URL can briefly lag behind a successful presigned upload.
    }

    if (attempt < 3) {
      await waitForSocialPublishingMediaAvailabilityRetry(attempt);
    }
  }

  throw new Error(
    "Zernio received this media, but its public link is not ready yet. Try posting again.",
  );
}
