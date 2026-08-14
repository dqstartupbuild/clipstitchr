import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";

export async function syncSocialPublishingExternalPosts(
  apiKey: string,
  accountIds: string[],
) {
  const results = await Promise.allSettled(
    accountIds.map((accountId) =>
      requestSocialPublishing("/v1/posts/sync-external", {
        apiKey,
        body: { accountId },
        method: "POST",
      }),
    ),
  );

  return results.filter((result) => result.status === "rejected").length;
}
