import { randomUUID } from "node:crypto";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { decryptSocialToken } from "@/lib/clipstitchr/server/social/decryptSocialToken";
import { encryptSocialToken } from "@/lib/clipstitchr/server/social/encryptSocialToken";
import { SocialNeedsAttentionError } from "./SocialNeedsAttentionError";
import { refreshInstagramAccessToken } from "./refreshInstagramAccessToken";
import { refreshTikTokAccessToken } from "./refreshTikTokAccessToken";

type SocialAccountTokenFields = {
  accessTokenCiphertext: string;
  accessTokenExpiresAt?: string;
  id: string;
  ownerId: string;
  platform: "tiktok" | "instagram";
  refreshTokenCiphertext?: string;
  tokenEncryptionVersion: number;
};

export async function getValidSocialAccessToken({
  account,
  client,
  providerWorkerSecret,
}: {
  account: SocialAccountTokenFields;
  client: ConvexHttpClient;
  providerWorkerSecret: string;
}) {
  const now = new Date().toISOString();
  const currentAccessToken = decryptSocialToken(
    account.accessTokenCiphertext,
    account.tokenEncryptionVersion,
  );

  if (
    !account.accessTokenExpiresAt ||
    Date.parse(account.accessTokenExpiresAt) > Date.parse(now) + 5 * 60_000
  ) {
    return currentAccessToken;
  }

  const lockId = `social-token-refresh:${randomUUID()}`;
  const acquired = await client.mutation(
    api.socialAccounts.acquireSocialTokenRefreshLock
      .acquireSocialTokenRefreshLock,
    {
      secret: providerWorkerSecret,
      ownerId: account.ownerId,
      id: account.id,
      lockId,
      lockedUntil: new Date(Date.parse(now) + 2 * 60_000).toISOString(),
      now,
    },
  );

  if (!acquired) {
    throw new Error("Another worker is refreshing this social account.");
  }

  try {
    if (account.platform === "tiktok") {
      if (!account.refreshTokenCiphertext) {
        throw new SocialNeedsAttentionError(
          "Reconnect TikTok so ClipStitchr can publish.",
        );
      }

      const refreshToken = decryptSocialToken(
        account.refreshTokenCiphertext,
        account.tokenEncryptionVersion,
      );
      const refreshed = await refreshTikTokAccessToken(refreshToken);
      const accessEnvelope = encryptSocialToken(refreshed.access_token);
      const refreshEnvelope = encryptSocialToken(refreshed.refresh_token);

      if (accessEnvelope.version !== refreshEnvelope.version) {
        throw new Error("Social token encryption changed during refresh.");
      }

      await client.mutation(
        api.socialAccounts.saveRefreshedSocialTokens.saveRefreshedSocialTokens,
        {
          secret: providerWorkerSecret,
          ownerId: account.ownerId,
          id: account.id,
          lockId,
          accessTokenCiphertext: accessEnvelope.ciphertext,
          accessTokenExpiresAt: new Date(
            Date.parse(now) + refreshed.expires_in * 1000,
          ).toISOString(),
          refreshTokenCiphertext: refreshEnvelope.ciphertext,
          refreshTokenExpiresAt: refreshed.refresh_expires_in
            ? new Date(
                Date.parse(now) + refreshed.refresh_expires_in * 1000,
              ).toISOString()
            : undefined,
          tokenEncryptionVersion: accessEnvelope.version,
          now,
        },
      );

      return refreshed.access_token;
    }

    const refreshed = await refreshInstagramAccessToken(currentAccessToken);
    const envelope = encryptSocialToken(refreshed.access_token);

    await client.mutation(
      api.socialAccounts.saveRefreshedSocialTokens.saveRefreshedSocialTokens,
      {
        secret: providerWorkerSecret,
        ownerId: account.ownerId,
        id: account.id,
        lockId,
        accessTokenCiphertext: envelope.ciphertext,
        accessTokenExpiresAt: new Date(
          Date.parse(now) + refreshed.expires_in * 1000,
        ).toISOString(),
        tokenEncryptionVersion: envelope.version,
        now,
      },
    );

    return refreshed.access_token;
  } catch (error) {
    try {
      await client.mutation(
        api.socialAccounts.releaseSocialTokenRefreshLock
          .releaseSocialTokenRefreshLock,
        {
          secret: providerWorkerSecret,
          ownerId: account.ownerId,
          id: account.id,
          lockId,
          now: new Date().toISOString(),
        },
      );
    } catch {
      // The two-minute lease remains the final recovery path.
    }

    throw error;
  }
}
