import type { PublishingCompatibilityIssue } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCompatibilityIssue";

export type PublishingDestinationCompatibility = {
  integrationId: string;
  issues: PublishingCompatibilityIssue[];
  status: "error" | "ready" | "warning";
};
