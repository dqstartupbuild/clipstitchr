import { randomBytes, randomUUID } from "node:crypto";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createSocialSecretHash } from "@/lib/clipstitchr/server/social/createSocialSecretHash";
import { getSocialPublicBaseUrl } from "@/lib/clipstitchr/server/social/getSocialPublicBaseUrl";

export async function createSocialMediaFetchUrl({
  client,
  objectKey,
  ownerId,
  providerWorkerSecret,
  targetId,
}: {
  client: ConvexHttpClient;
  objectKey: string;
  ownerId: string;
  providerWorkerSecret: string;
  targetId: string;
}) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.parse(now) + 24 * 60 * 60_000).toISOString();

  await client.mutation(
    api.socialMedia.createSocialMediaAccessGrant
      .createSocialMediaAccessGrant,
    {
      secret: providerWorkerSecret,
      ownerId,
      id: `social-media-grant:${randomUUID()}`,
      targetId,
      objectKey,
      tokenHash: createSocialSecretHash(token),
      expiresAt,
      now,
    },
  );

  return `${getSocialPublicBaseUrl()}/api/social/media/${encodeURIComponent(token)}`;
}
