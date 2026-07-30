export type SocialPublishDocument = {
  account: {
    accessTokenCiphertext: string;
    accessTokenExpiresAt?: string;
    capabilitySnapshotJson?: string;
    externalAccountId: string;
    id: string;
    ownerId: string;
    platform: "tiktok" | "instagram";
    refreshTokenCiphertext?: string;
    tokenEncryptionVersion: number;
    username: string;
  };
  assets: Array<{
    contentType: string;
    durationSeconds?: number;
    height?: number;
    id: string;
    kind: "video" | "image";
    objectKey: string;
    order: number;
    sizeBytes: number;
    width?: number;
  }>;
  attempts: Array<{
    id: string;
    providerContainerId?: string;
    providerPublishId?: string;
    retrySafety?: string;
    stage?: string;
    status: "running" | "succeeded" | "failed" | "ambiguous";
  }>;
  post: {
    caption: string;
    id: string;
    ownerId: string;
    productId: string;
    title: string;
  };
  publications: Array<{
    externalPublicationId: string;
    id: string;
  }>;
  target: {
    controlsJson: string;
    id: string;
    platform: "tiktok" | "instagram";
    postId: string;
    publishMode: "direct" | "draft";
    socialAccountId: string;
    status: string;
  };
};
