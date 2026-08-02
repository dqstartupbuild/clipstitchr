import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export type PublishingProviderGroup = {
  canConnect: boolean;
  integrations: PublishingIntegration[];
  provider: PublishingProvider;
  unavailableReason: string | null;
};
