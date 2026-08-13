import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export type PublishingIntegration = {
  avatarUrl: string | null;
  displayName: string;
  expiresAt: string | null;
  id: string;
  provider: PublishingProvider;
  status: "connected" | "needs-attention";
  statusMessage: string | null;
  username: string | null;
};
