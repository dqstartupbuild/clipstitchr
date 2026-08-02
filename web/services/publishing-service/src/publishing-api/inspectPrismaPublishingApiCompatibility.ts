import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingApiCompatibilityRequest } from "./PublishingApiCompatibilityRequest.js";
import { createPublishingApiCompatibilityIssues } from "./createPublishingApiCompatibilityIssues.js";
import { readOwnedPublishingApiIntegrations } from "./readOwnedPublishingApiIntegrations.js";

export const inspectPrismaPublishingApiCompatibility = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  request: PublishingApiCompatibilityRequest,
) => {
  const integrations = await readOwnedPublishingApiIntegrations(
    database,
    tenantKey,
    request.destinations,
  );
  return Object.freeze({
    destinations: Object.freeze(
      request.destinations.map((destination) => {
        const integration = integrations.get(destination.integrationId)!;
        const issues = [
          ...(integration.disabled || integration.refreshNeeded
            ? [
                Object.freeze({
                  code: "connection_needs_attention",
                  message: "Reconnect this account before publishing.",
                  severity: "error" as const,
                }),
              ]
            : []),
          ...createPublishingApiCompatibilityIssues(
            destination.provider,
            request.media.objects,
          ),
        ].slice(0, 50);
        const status = issues.some(({ severity }) => severity === "error")
          ? "error"
          : issues.some(({ severity }) => severity === "warning")
            ? "warning"
            : "ready";
        return Object.freeze({
          integrationId: destination.integrationId,
          issues: Object.freeze(issues),
          status,
        });
      }),
    ),
    mediaRevision: request.mediaRevision,
  });
};
