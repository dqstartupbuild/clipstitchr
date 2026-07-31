export type SocialAnalyticsRefreshDocument = {
  run: {
    id: string;
    includeTikTokSaves: boolean;
    ownerId: string;
    status:
      | "queued"
      | "running"
      | "completed"
      | "partially_completed"
      | "failed"
      | "canceled";
  };
  documents: Array<{
    account: null | {
      accessTokenCiphertext: string;
      accessTokenExpiresAt?: string;
      id: string;
      ownerId: string;
      platform: "tiktok" | "instagram";
      refreshTokenCiphertext?: string;
      status: string;
      tokenEncryptionVersion: number;
      username: string;
    };
    post: {
      id: string;
      productId: string;
      title: string;
    };
    publication: {
      externalPublicationId: string;
      id: string;
      ownerId: string;
      permalink?: string;
      platform: "tiktok" | "instagram";
      postId: string;
      socialAccountId: string;
      targetId: string;
    };
    target: {
      id: string;
    };
  }>;
};
