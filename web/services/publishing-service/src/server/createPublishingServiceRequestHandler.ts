import type { RequestListener } from "node:http";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { enforcePublishingRateLimit } from "../rate-limits/enforcePublishingRateLimit.js";
import { checkPublishingServiceReadiness } from "../health/checkPublishingServiceReadiness.js";
import { createPublishingServiceHealthReport } from "../health/createPublishingServiceHealthReport.js";
import { authenticatePublishingServiceRequest } from "./authenticatePublishingServiceRequest.js";
import { findPublishingServiceRoute } from "./findPublishingServiceRoute.js";
import { hasPublishingServiceRoutePath } from "./hasPublishingServiceRoutePath.js";
import type { PublishingServiceRequestHandlerOptions } from "./PublishingServiceRequestHandlerOptions.js";
import { readBoundedJsonRequestBody } from "./readBoundedJsonRequestBody.js";
import { writePublishingServiceError } from "./writePublishingServiceError.js";
import { writeJsonResponse } from "./writeJsonResponse.js";

export const createPublishingServiceRequestHandler = (
  options: PublishingServiceRequestHandlerOptions,
): RequestListener =>
  (request, response): void => {
    const method = request.method ?? "GET";
    const omitBody = method === "HEAD";
    let url: URL;

    try {
      if ((request.url?.length ?? 0) > 2_048) {
        throw new TypeError("URL is too long.");
      }
      url = new URL(request.url ?? "/", "http://publishing.internal");
    } catch {
      writeJsonResponse(response, 400, { status: "invalid_request" }, omitBody);
      return;
    }
    const path = url.pathname;

    if (path === "/healthz") {
      if (method !== "GET" && method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD");
        writeJsonResponse(response, 405, { status: "method_not_allowed" }, omitBody);
        return;
      }
      writeJsonResponse(response, 200, createPublishingServiceHealthReport(), omitBody);
      return;
    }

    if (path === "/readyz") {
      if (method !== "GET" && method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD");
        writeJsonResponse(response, 405, { status: "method_not_allowed" }, omitBody);
        return;
      }
      void checkPublishingServiceReadiness(
        options.readinessDependencies,
        options.readinessTimeoutMilliseconds,
      )
        .then((report) => {
          writeJsonResponse(
            response,
            report.status === "ready" ? 200 : 503,
            report,
            omitBody,
          );
        })
        .catch(() => {
          writeJsonResponse(
            response,
            503,
            {
              service: "clipstitchr-publishing-service",
              status: "not_ready",
              checks: [],
            },
            omitBody,
          );
        });
      return;
    }

    if (path === "/v1/webhooks/tiktok") {
      if (method !== "POST") {
        response.setHeader("Allow", "POST");
        writeJsonResponse(response, 405, { status: "method_not_allowed" });
        return;
      }
      if (url.searchParams.size !== 0) {
        writeJsonResponse(response, 400, { status: "invalid_request" });
        return;
      }
      if (options.tikTokWebhookHandler === undefined) {
        writeJsonResponse(response, 503, {
          code: "service_not_configured",
          message: "Publishing is temporarily unavailable.",
        });
        return;
      }

      void options
        .tikTokWebhookHandler(request)
        .then((result) => {
          if (result.status !== 200) {
            throw new TypeError("TikTok webhook returned an invalid status.");
          }
          writeJsonResponse(response, result.status, result.body);
        })
        .catch((error: unknown) => {
          if (!response.headersSent) {
            writePublishingServiceError(response, error);
          } else {
            response.destroy();
          }
        });
      return;
    }

    const routes = options.routes ?? [];
    const matched = findPublishingServiceRoute(routes, method, path);

    if (matched === null) {
      if (hasPublishingServiceRoutePath(routes, path)) {
        writeJsonResponse(response, 405, { status: "method_not_allowed" }, omitBody);
      } else {
        writeJsonResponse(response, 404, { status: "not_found" }, omitBody);
      }
      return;
    }

    const authentication = options.authentication;
    const rateLimiter = options.rateLimiter;

    if (authentication === undefined || rateLimiter === undefined) {
      writeJsonResponse(response, 503, {
        code: "service_not_configured",
        message: "Publishing is temporarily unavailable.",
      });
      return;
    }

    void (async () => {
      const claims = await authenticatePublishingServiceRequest({
        headers: request.headers,
        expectedAction:
          matched.route.additionalActions === undefined
            ? matched.route.action
            : [matched.route.action, ...matched.route.additionalActions],
        expectedAudience: authentication.audience,
        expectedIssuer: authentication.issuer,
        replayProtector: authentication.replayProtector,
        signingKey: authentication.signingKey,
      });

      await enforcePublishingRateLimit(rateLimiter, {
        action:
          matched.route.rateLimitActionByAssertion?.[claims.action] ??
          matched.route.rateLimitAction,
        tenantKey: claims.tenantKey as PublishingTenantKey,
      });

      const body =
        matched.route.body === "json"
          ? await readBoundedJsonRequestBody(
              { headers: request.headers, body: request },
              matched.route.maximumBodyBytes,
            )
          : undefined;
      const result = await matched.route.handle({
        body,
        claims,
        match: matched.match,
        request,
        searchParams: url.searchParams,
      });

      if (
        !Number.isInteger(result.status) ||
        result.status < 200 ||
        result.status > 299
      ) {
        throw new TypeError("Publishing route returned an invalid status.");
      }

      writeJsonResponse(response, result.status, result.body);
    })().catch((error: unknown) => {
      if (!response.headersSent) {
        writePublishingServiceError(response, error);
      } else {
        response.destroy();
      }
    });
  };
