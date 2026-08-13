import type { PublishingMediaCompatibilityIssue } from "@/lib/clipstitchr/publishing/media/PublishingMediaCompatibilityIssue";
import type { PublishingMediaProvider } from "@/lib/clipstitchr/publishing/media/PublishingMediaProvider";

export type PublishingMediaCompatibilityReport = {
  issues: readonly PublishingMediaCompatibilityIssue[];
  provider: PublishingMediaProvider;
  providerAcceptanceStillRequired: true;
  status:
    | "metadata-incompatible"
    | "metadata-ready"
    | "metadata-ready-with-warnings";
};
