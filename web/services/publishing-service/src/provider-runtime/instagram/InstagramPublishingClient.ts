import type { ProviderAnalyticsMetric } from "../contracts/ProviderAnalyticsMetric.js";
import type { ProviderPublishResult } from "../contracts/ProviderPublishResult.js";
import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import { executeProviderRequestWithResponse } from "../http/executeProviderRequestWithResponse.js";
import type { ProviderHttpClient } from "../http/ProviderHttpClient.js";
import { parseRetryAfterSeconds } from "../http/parseRetryAfterSeconds.js";
import { readProviderNumber } from "../parsing/readProviderNumber.js";
import { readProviderRecord } from "../parsing/readProviderRecord.js";
import { readProviderString } from "../parsing/readProviderString.js";
import type { PublishingProvider } from "../../providers/PublishingProvider.js";
import type { InstagramMedia } from "./InstagramMedia.js";
import type { InstagramPublishingLimit } from "./InstagramPublishingLimit.js";
import type { InstagramPublishCheckpoint } from "./InstagramPublishCheckpoint.js";
import type { InstagramPublishProgress } from "./InstagramPublishProgress.js";
import type { InstagramPublishRequest } from "./InstagramPublishRequest.js";
import type { MetaGraphVersion } from "./MetaGraphVersion.js";

type InstagramPublishingClientOptions = Readonly<{
  provider: Extract<PublishingProvider, "instagram" | "instagram-standalone">;
  graphHost: "graph.facebook.com" | "graph.instagram.com";
  graphVersion: MetaGraphVersion;
  http: ProviderHttpClient;
}>;

export class InstagramPublishingClient {
  readonly #provider: Extract<
    PublishingProvider,
    "instagram" | "instagram-standalone"
  >;
  readonly #graphOrigin: string;
  readonly #graphVersion: MetaGraphVersion;
  readonly #http: ProviderHttpClient;

  constructor(options: InstagramPublishingClientOptions) {
    this.#provider = options.provider;
    this.#graphOrigin = `https://${options.graphHost}`;
    this.#graphVersion = options.graphVersion;
    this.#http = options.http;
  }

  async advancePublish(
    request: InstagramPublishRequest,
    checkpoint?: InstagramPublishCheckpoint,
  ): Promise<InstagramPublishProgress> {
    this.#validatePublishRequest(request);
    let current = checkpoint;

    if (current === undefined) {
      const limit = await this.getPublishingLimit(
        request.accountId,
        request.accessToken,
      );
      if (limit.quotaUsage >= limit.quotaTotal) {
        throw new ProviderRuntimeError(this.#provider, "rate_limited", false);
      }
      current = Object.freeze({
        attemptKey: request.attemptKey,
        accountId: request.accountId,
        mediaCount: request.media.length,
        phase: "create_child" as const,
        childContainerIds: Object.freeze([]),
        nextMediaIndex: 0,
        activeContainerId: undefined,
        parentContainerId: undefined,
        mediaId: undefined,
        permalink: undefined,
      });
    } else {
      this.#assertCheckpoint(request, current);
    }

    switch (current.phase) {
      case "create_child": {
        const media = request.media[current.nextMediaIndex];
        if (media === undefined) {
          throw new ProviderRuntimeError(this.#provider, "invalid_request");
        }
        let containerId: string;
        try {
          containerId = await this.#createMediaContainer(
            request,
            media,
            request.media.length > 1,
          );
        } catch (error) {
          if (this.#isAmbiguousNetworkFailure(error)) {
            const dispatched = Object.freeze({
              ...current,
              phase: "create_child_dispatched" as const,
            });
            return this.#progress(dispatched, "outcome_unknown", undefined);
          }
          throw error;
        }
        const next = Object.freeze({
          ...current,
          phase: "wait_child" as const,
          childContainerIds: Object.freeze([
            ...current.childContainerIds,
            containerId,
          ]),
          activeContainerId: containerId,
        });
        return this.#progress(next, "accepted", containerId);
      }
      case "create_child_dispatched":
        return this.#progress(current, "outcome_unknown", undefined);
      case "wait_child": {
        const containerId = current.activeContainerId;
        if (containerId === undefined) {
          throw new ProviderRuntimeError(this.#provider, "invalid_request");
        }
        const status = await this.#getContainerStatus(
          containerId,
          request.accessToken,
        );
        if (status === "IN_PROGRESS") {
          return this.#progress(current, "processing", containerId);
        }
        const nextMediaIndex = current.nextMediaIndex + 1;
        const phase =
          nextMediaIndex < request.media.length
            ? "create_child"
            : request.media.length > 1
              ? "create_parent"
              : "ready_to_publish";
        const next = Object.freeze({
          ...current,
          phase,
          nextMediaIndex,
          activeContainerId:
            phase === "ready_to_publish" ? containerId : undefined,
        });
        return this.#progress(next, "accepted", containerId);
      }
      case "create_parent": {
        let response: Readonly<Record<string, unknown>>;
        try {
          response = await this.#requestRecord(
            `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(request.accountId)}/media`,
            "POST",
            new URLSearchParams({
              media_type: "CAROUSEL",
              caption: request.caption,
              children: current.childContainerIds.join(","),
            }),
            request.accessToken,
          );
        } catch (error) {
          if (this.#isAmbiguousNetworkFailure(error)) {
            const dispatched = Object.freeze({
              ...current,
              phase: "create_parent_dispatched" as const,
            });
            return this.#progress(dispatched, "outcome_unknown", undefined);
          }
          throw error;
        }
        const parentContainerId = readProviderString(
          this.#provider,
          response["id"],
        );
        const next = Object.freeze({
          ...current,
          phase: "wait_parent" as const,
          activeContainerId: parentContainerId,
          parentContainerId,
        });
        return this.#progress(next, "accepted", parentContainerId);
      }
      case "create_parent_dispatched":
        return this.#progress(current, "outcome_unknown", undefined);
      case "wait_parent": {
        const parentContainerId = current.parentContainerId;
        if (parentContainerId === undefined) {
          throw new ProviderRuntimeError(this.#provider, "invalid_request");
        }
        const status = await this.#getContainerStatus(
          parentContainerId,
          request.accessToken,
        );
        if (status === "IN_PROGRESS") {
          return this.#progress(current, "processing", parentContainerId);
        }
        const next = Object.freeze({
          ...current,
          phase: "ready_to_publish" as const,
          activeContainerId: parentContainerId,
        });
        return this.#progress(next, "accepted", parentContainerId);
      }
      case "ready_to_publish": {
        const publishContainerId = current.activeContainerId;
        if (publishContainerId === undefined) {
          throw new ProviderRuntimeError(this.#provider, "invalid_request");
        }
        let published: Readonly<Record<string, unknown>>;
        try {
          published = await this.#requestRecord(
            `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(request.accountId)}/media_publish`,
            "POST",
            new URLSearchParams({ creation_id: publishContainerId }),
            request.accessToken,
          );
        } catch (error) {
          if (this.#isAmbiguousNetworkFailure(error)) {
            const dispatched = Object.freeze({
              ...current,
              phase: "publish_dispatched" as const,
            });
            return this.#progress(
              dispatched,
              "outcome_unknown",
              publishContainerId,
            );
          }
          throw error;
        }
        const mediaId = readProviderString(this.#provider, published["id"]);
        let permalink: string | undefined;
        try {
          const details = await this.#requestRecord(
            `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(mediaId)}?${new URLSearchParams(
              { fields: "id,permalink" },
            ).toString()}`,
            "GET",
            undefined,
            request.accessToken,
          );
          permalink =
            typeof details["permalink"] === "string"
              ? details["permalink"]
              : undefined;
        } catch {
          permalink = undefined;
        }
        const complete = Object.freeze({
          ...current,
          phase: "published" as const,
          mediaId,
          permalink,
        });
        return this.#publishedProgress(complete);
      }
      case "publish_dispatched":
        return this.#progress(
          current,
          "outcome_unknown",
          current.activeContainerId,
        );
      case "published":
        return this.#publishedProgress(current);
    }
  }

  async getPublishingLimit(
    accountId: string,
    accessToken: string,
  ): Promise<InstagramPublishingLimit> {
    const response = await this.#requestRecord(
      `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(accountId)}/content_publishing_limit?${new URLSearchParams(
        { fields: "quota_usage,config" },
      ).toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const rows = response["data"];
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ProviderRuntimeError(this.#provider, "invalid_response");
    }
    const first = readProviderRecord(this.#provider, rows[0]);
    const config = readProviderRecord(this.#provider, first["config"]);

    return Object.freeze({
      quotaUsage: readProviderNumber(this.#provider, first["quota_usage"]),
      quotaTotal: readProviderNumber(this.#provider, config["quota_total"]),
      quotaDurationSeconds: readProviderNumber(
        this.#provider,
        config["quota_duration"],
      ),
    });
  }

  async getPostAnalytics(
    postId: string,
    accessToken: string,
    metrics: readonly string[],
  ): Promise<readonly ProviderAnalyticsMetric[]> {
    if (metrics.length === 0) {
      return Object.freeze([]);
    }

    const response = await this.#requestRecord(
      `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(postId)}/insights?${new URLSearchParams(
        { metric: metrics.join(",") },
      ).toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const data = response["data"];
    if (!Array.isArray(data)) {
      throw new ProviderRuntimeError(this.#provider, "invalid_response");
    }

    return Object.freeze(
      data.map((entry) => {
        const record = readProviderRecord(this.#provider, entry);
        const name = readProviderString(this.#provider, record["name"]);
        const values = record["values"];
        const firstValue = Array.isArray(values) ? values[0] : undefined;
        const valueRecord =
          firstValue === undefined
            ? undefined
            : readProviderRecord(this.#provider, firstValue);
        const rawValue = valueRecord?.["value"];
        return Object.freeze({
          name,
          value: typeof rawValue === "number" ? rawValue : undefined,
        });
      }),
    );
  }

  async #createMediaContainer(
    request: InstagramPublishRequest,
    media: InstagramMedia,
    isCarouselItem: boolean,
  ): Promise<string> {
    const body = new URLSearchParams();
    body.set(media.kind === "video" ? "video_url" : "image_url", media.url);

    if (isCarouselItem) {
      body.set("is_carousel_item", "true");
      if (media.kind === "video") {
        body.set("media_type", "VIDEO");
      }
    } else {
      body.set("caption", request.caption);
      if (request.placement === "story") {
        body.set("media_type", "STORIES");
      } else if (media.kind === "video") {
        body.set("media_type", "REELS");
      }
    }

    if (
      media.kind === "video" &&
      media.thumbnailOffsetMilliseconds !== undefined &&
      request.placement !== "story"
    ) {
      body.set("thumb_offset", String(media.thumbnailOffsetMilliseconds));
    }

    const response = await this.#requestRecord(
      `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(request.accountId)}/media`,
      "POST",
      body,
      request.accessToken,
    );
    return readProviderString(this.#provider, response["id"]);
  }

  async #getContainerStatus(
    containerId: string,
    accessToken: string,
  ): Promise<"IN_PROGRESS" | "FINISHED" | "PUBLISHED"> {
    const response = await this.#requestRecord(
      `${this.#graphOrigin}/${this.#graphVersion}/${encodeURIComponent(containerId)}?${new URLSearchParams(
        { fields: "status_code" },
      ).toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const status = readProviderString(this.#provider, response["status_code"]);
    if (status === "ERROR" || status === "EXPIRED") {
      throw new ProviderRuntimeError(this.#provider, "rejected");
    }
    if (
      status !== "IN_PROGRESS" &&
      status !== "FINISHED" &&
      status !== "PUBLISHED"
    ) {
      throw new ProviderRuntimeError(this.#provider, "invalid_response");
    }
    return status;
  }

  async #requestRecord(
    url: string,
    method: "GET" | "POST",
    body?: URLSearchParams,
    accessToken?: string,
  ): Promise<Readonly<Record<string, unknown>>> {
    const response = await executeProviderRequestWithResponse(this.#http, {
      provider: this.#provider,
      url,
      method,
      headers: {
        ...(body === undefined
          ? {}
          : { "Content-Type": "application/x-www-form-urlencoded" }),
        ...(accessToken === undefined
          ? {}
          : { Authorization: `Bearer ${accessToken}` }),
      },
      ...(body === undefined ? {} : { body: body.toString() }),
    });
    const record = readProviderRecord(this.#provider, response.body);
    if (record["error"] !== undefined) {
      const error = readProviderRecord(this.#provider, record["error"]);
      const code = error["code"];
      if (code === 190) {
        throw new ProviderRuntimeError(this.#provider, "auth_required");
      }
      if (code === 4 || code === 32 || code === 613) {
        throw new ProviderRuntimeError(
          this.#provider,
          "rate_limited",
          true,
          parseRetryAfterSeconds(response.headers["retry-after"]),
        );
      }
      if (code === 1 || code === 2) {
        throw new ProviderRuntimeError(
          this.#provider,
          "transient_failure",
          true,
        );
      }
      throw new ProviderRuntimeError(this.#provider, "rejected");
    }
    return record;
  }

  #progress(
    checkpoint: InstagramPublishCheckpoint,
    kind: Extract<
      ProviderPublishResult["kind"],
      "accepted" | "processing" | "outcome_unknown"
    >,
    operationId: string | undefined,
  ): InstagramPublishProgress {
    return Object.freeze({
      checkpoint,
      result: Object.freeze({
        provider: this.#provider,
        kind,
        providerOperationId: operationId,
        remotePostIds: Object.freeze([]),
        remoteUrls: Object.freeze([]),
        visibility: undefined,
      }),
    });
  }

  #publishedProgress(
    checkpoint: InstagramPublishCheckpoint,
  ): InstagramPublishProgress {
    if (checkpoint.mediaId === undefined) {
      throw new ProviderRuntimeError(this.#provider, "invalid_request");
    }
    return Object.freeze({
      checkpoint,
      result: Object.freeze({
        provider: this.#provider,
        kind: "published",
        providerOperationId: checkpoint.activeContainerId,
        remotePostIds: Object.freeze([checkpoint.mediaId]),
        remoteUrls: Object.freeze(
          checkpoint.permalink === undefined ? [] : [checkpoint.permalink],
        ),
        visibility: undefined,
      }),
    });
  }

  #assertCheckpoint(
    request: InstagramPublishRequest,
    checkpoint: InstagramPublishCheckpoint,
  ): void {
    if (
      checkpoint.attemptKey !== request.attemptKey ||
      checkpoint.accountId !== request.accountId ||
      checkpoint.mediaCount !== request.media.length ||
      checkpoint.childContainerIds.length > request.media.length ||
      checkpoint.nextMediaIndex < 0 ||
      checkpoint.nextMediaIndex > request.media.length
    ) {
      throw new ProviderRuntimeError(this.#provider, "invalid_request");
    }
  }

  #isAmbiguousNetworkFailure(error: unknown): boolean {
    return (
      error instanceof ProviderRuntimeError &&
      (error.code === "network" || error.code === "transient_failure")
    );
  }

  #validatePublishRequest(request: InstagramPublishRequest): void {
    if (
      request.attemptKey.length < 16 ||
      request.accountId.length === 0 ||
      request.accessToken.length === 0 ||
      request.media.length < 1 ||
      request.media.length > 10 ||
      Array.from(request.caption).length > 2_200 ||
      (request.placement === "story" && request.media.length !== 1) ||
      (request.placement === "reel" &&
        (request.media.length !== 1 || request.media[0]?.kind !== "video"))
    ) {
      throw new ProviderRuntimeError(this.#provider, "invalid_request");
    }

    for (const media of request.media) {
      try {
        const url = new URL(media.url);
        if (url.protocol !== "https:") {
          throw new TypeError("HTTPS required");
        }
      } catch {
        throw new ProviderRuntimeError(this.#provider, "invalid_request");
      }
    }
  }
}
