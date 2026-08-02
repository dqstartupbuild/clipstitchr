import type { ReadinessCheckResult } from "./ReadinessCheckResult.js";

export type PublishingServiceReadinessReport = Readonly<{
  service: "clipstitchr-publishing-service";
  status: "ready" | "not_ready";
  checks: readonly ReadinessCheckResult[];
}>;
