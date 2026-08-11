export async function waitForSocialPublishingMediaAvailabilityRetry(
  attempt: number,
) {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.min(250 * 2 ** attempt, 1000)),
  );
}
