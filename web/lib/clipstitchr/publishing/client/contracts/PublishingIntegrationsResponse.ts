import type { PublishingProviderGroup } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProviderGroup";

export type PublishingIntegrationsResponse = {
  providers: PublishingProviderGroup[];
};
