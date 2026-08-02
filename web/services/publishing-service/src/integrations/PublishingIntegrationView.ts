import type { PublicPublishingProvider } from "./PublicPublishingProvider.js";

export type PublishingIntegrationView = Readonly<{
  avatarUrl: string | null;
  displayName: string;
  expiresAt: string | null;
  id: string;
  provider: PublicPublishingProvider;
  status: "connected" | "needs-attention";
  statusMessage: string | null;
  username: string | null;
}>;
