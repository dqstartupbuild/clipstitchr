import type { ProviderAnalyticsMetric } from "../contracts/ProviderAnalyticsMetric.js";
import type { ProviderConnection } from "../contracts/ProviderConnection.js";
import type { ProviderPublishResult } from "../contracts/ProviderPublishResult.js";
import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import { executeProviderRequestWithResponse } from "../http/executeProviderRequestWithResponse.js";
import type { ProviderHttpClient } from "../http/ProviderHttpClient.js";
import { parseRetryAfterSeconds } from "../http/parseRetryAfterSeconds.js";
import { readProviderNumber } from "../parsing/readProviderNumber.js";
import { readProviderRecord } from "../parsing/readProviderRecord.js";
import { readProviderString } from "../parsing/readProviderString.js";
import { assertOAuthStateToken } from "../../oauth/assertOAuthStateToken.js";
import type { TikTokCreatorInfo } from "./TikTokCreatorInfo.js";
import type { TikTokPublishRequest } from "./TikTokPublishRequest.js";
import type { TikTokPullMediaVerifier } from "./TikTokPullMediaVerifier.js";

type TikTokProviderAdapterOptions = Readonly<{
  clientId: string;
  clientSecret: string;
  http: ProviderHttpClient;
  verifiedMediaOrigin: string;
  verifyPullMediaUrl: TikTokPullMediaVerifier;
  now?: () => number;
  creatorInfoMaximumAgeMilliseconds?: number;
}>;

const TIKTOK_IDENTITY_SCOPES = Object.freeze(["user.info.basic"]);
const TIKTOK_REQUESTED_SCOPES = Object.freeze([
  "user.info.basic",
  "video.publish",
  "video.upload",
  "user.info.stats",
  "video.list",
]);

export class TikTokProviderAdapter {
  readonly id = "tiktok" as const;
  readonly pkceMode = "none" as const;
  readonly #clientId: string;
  readonly #clientSecret: string;
  readonly #http: ProviderHttpClient;
  readonly #verifiedMediaOrigin: string;
  readonly #verifyPullMediaUrl: TikTokPullMediaVerifier;
  readonly #now: () => number;
  readonly #creatorInfoMaximumAgeMilliseconds: number;

  constructor(options: TikTokProviderAdapterOptions) {
    if (options.clientId.length === 0 || options.clientSecret.length < 12) {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
    this.#clientId = options.clientId;
    this.#clientSecret = options.clientSecret;
    this.#http = options.http;
    this.#verifyPullMediaUrl = options.verifyPullMediaUrl;
    try {
      const mediaOrigin = new URL(options.verifiedMediaOrigin);
      if (
        mediaOrigin.protocol !== "https:" ||
        mediaOrigin.username.length > 0 ||
        mediaOrigin.password.length > 0 ||
        mediaOrigin.pathname !== "/" ||
        mediaOrigin.search.length > 0 ||
        mediaOrigin.hash.length > 0
      ) {
        throw new TypeError("Invalid media origin");
      }
      this.#verifiedMediaOrigin = mediaOrigin.origin;
    } catch {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
    this.#now = options.now ?? Date.now;
    this.#creatorInfoMaximumAgeMilliseconds =
      options.creatorInfoMaximumAgeMilliseconds ?? 300_000;
    if (
      !Number.isSafeInteger(this.#creatorInfoMaximumAgeMilliseconds) ||
      this.#creatorInfoMaximumAgeMilliseconds < 0
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
  }

  createAuthorizationUrl(state: string, redirectUri: string): string {
    assertOAuthStateToken(state);
    const callback = this.#readRedirectUri(redirectUri);
    const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
    url.search = new URLSearchParams({
      client_key: this.#clientId,
      redirect_uri: callback,
      state,
      response_type: "code",
      scope: TIKTOK_REQUESTED_SCOPES.join(","),
    }).toString();
    return url.toString();
  }

  async exchangeAuthorizationCode(
    code: string,
    redirectUri: string,
  ): Promise<ProviderConnection> {
    if (code.length === 0) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const token = await this.#requestRecord(
      "https://open.tiktokapis.com/v2/oauth/token/",
      "POST",
      new URLSearchParams({
        client_key: this.#clientId,
        client_secret: this.#clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.#readRedirectUri(redirectUri),
      }),
      false,
    );
    return this.#readConnection(token);
  }

  async refreshConnection(refreshToken: string): Promise<ProviderConnection> {
    if (refreshToken.length === 0) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const token = await this.#requestRecord(
      "https://open.tiktokapis.com/v2/oauth/token/",
      "POST",
      new URLSearchParams({
        client_key: this.#clientId,
        client_secret: this.#clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      false,
    );
    return this.#readConnection(token);
  }

  async getCreatorInfo(accessToken: string): Promise<TikTokCreatorInfo> {
    const response = await this.#requestRecord(
      "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
      "POST",
      undefined,
      true,
      accessToken,
    );
    const data = readProviderRecord(this.id, response["data"]);
    const options = data["privacy_level_options"];
    if (!Array.isArray(options) || !options.every((item) => typeof item === "string")) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }

    return Object.freeze({
      fetchedAtEpochMilliseconds: this.#now(),
      username:
        typeof data["creator_username"] === "string"
          ? data["creator_username"]
          : undefined,
      nickname:
        typeof data["creator_nickname"] === "string"
          ? data["creator_nickname"]
          : undefined,
      privacyLevelOptions: Object.freeze([...options]),
      commentsDisabled: data["comment_disabled"] === true,
      duetDisabled: data["duet_disabled"] === true,
      stitchDisabled: data["stitch_disabled"] === true,
      maxVideoDurationSeconds: readProviderNumber(
        this.id,
        data["max_video_post_duration_sec"],
      ),
    });
  }

  async publish(request: TikTokPublishRequest): Promise<ProviderPublishResult> {
    this.#validatePublishRequest(request);
    for (const mediaUrl of request.media.urls) {
      let verified = false;
      try {
        verified = await this.#verifyPullMediaUrl(new URL(mediaUrl));
      } catch {
        verified = false;
      }
      if (!verified) {
        throw new ProviderRuntimeError(this.id, "invalid_request");
      }
    }
    const isPhoto = request.media.kind === "photo";
    const endpoint = isPhoto
      ? "/v2/post/publish/content/init/"
      : request.mode === "direct"
        ? "/v2/post/publish/video/init/"
        : "/v2/post/publish/inbox/video/init/";
    const postInfo: Record<string, unknown> = {};

    if (request.media.kind === "photo" && request.photoTitle !== undefined) {
      postInfo["title"] = request.photoTitle;
      postInfo["description"] = request.caption;
    } else if (request.caption.length > 0) {
      postInfo["title"] = request.caption;
    }

    if (request.mode === "direct") {
      postInfo["privacy_level"] = request.privacyLevel;
      postInfo["disable_comment"] = !request.allowComment;
      if (!isPhoto) {
        postInfo["disable_duet"] = !request.allowDuet;
        postInfo["disable_stitch"] = !request.allowStitch;
        postInfo["is_aigc"] = request.isAigc;
      }
      postInfo["brand_content_toggle"] = request.brandContent;
      postInfo["brand_organic_toggle"] = request.brandOrganic;
      if (isPhoto) {
        postInfo["auto_add_music"] = request.autoAddMusic;
      }
    }

    const sourceInfo = isPhoto
      ? {
          source: "PULL_FROM_URL",
          photo_cover_index: 0,
          photo_images: request.media.urls,
        }
      : {
          source: "PULL_FROM_URL",
          video_url: request.media.urls[0],
        };
    const body = {
      post_info: postInfo,
      ...(isPhoto
        ? {
            post_mode: request.mode === "direct" ? "DIRECT_POST" : "MEDIA_UPLOAD",
            media_type: "PHOTO",
          }
        : {}),
      source_info: sourceInfo,
    };
    let response: Readonly<Record<string, unknown>>;
    try {
      response = await this.#requestRecord(
        `https://open.tiktokapis.com${endpoint}`,
        "POST",
        JSON.stringify(body),
        true,
        request.accessToken,
      );
    } catch (error) {
      if (
        error instanceof ProviderRuntimeError &&
        (error.code === "network" || error.code === "transient_failure")
      ) {
        return Object.freeze({
          provider: this.id,
          kind: "outcome_unknown",
          providerOperationId: undefined,
          remotePostIds: Object.freeze([]),
          remoteUrls: Object.freeze([]),
          visibility: request.privacyLevel,
        });
      }
      throw error;
    }
    const data = readProviderRecord(this.id, response["data"]);
    const publishId = readProviderString(this.id, data["publish_id"]);

    return Object.freeze({
      provider: this.id,
      kind: "accepted",
      providerOperationId: publishId,
      remotePostIds: Object.freeze([]),
      remoteUrls: Object.freeze([]),
      visibility: request.privacyLevel,
    });
  }

  async getPostStatus(
    accessToken: string,
    publishId: string,
  ): Promise<ProviderPublishResult> {
    if (accessToken.length === 0 || publishId.length === 0) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const response = await this.#requestRecord(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      "POST",
      JSON.stringify({ publish_id: publishId }),
      true,
      accessToken,
    );
    const data = readProviderRecord(this.id, response["data"]);
    const status = readProviderString(this.id, data["status"]);
    const publicIds = data["publicaly_available_post_id"];
    const remotePostIds = Array.isArray(publicIds)
      ? publicIds.filter((value): value is string => typeof value === "string")
      : [];

    switch (status) {
      case "PROCESSING_UPLOAD":
      case "PROCESSING_DOWNLOAD":
        return this.#statusResult("media_transfer_pending", publishId, []);
      case "PUBLISH_COMPLETE":
        return this.#statusResult(
          remotePostIds.length > 0 ? "published" : "published_not_public",
          publishId,
          remotePostIds,
        );
      case "SEND_TO_USER_INBOX":
        return this.#statusResult("requires_user_action", publishId, []);
      case "FAILED":
        return this.#statusResult("rejected", publishId, []);
      default:
        throw new ProviderRuntimeError(this.id, "invalid_response");
    }
  }

  async getPostAnalytics(
    accessToken: string,
    postId: string,
  ): Promise<readonly ProviderAnalyticsMetric[]> {
    const response = await this.#requestRecord(
      "https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count",
      "POST",
      JSON.stringify({ filters: { video_ids: [postId] } }),
      true,
      accessToken,
    );
    const data = readProviderRecord(this.id, response["data"]);
    const videos = data["videos"];
    if (!Array.isArray(videos)) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }
    if (videos.length === 0) {
      return Object.freeze([]);
    }
    const video = readProviderRecord(this.id, videos[0]);
    const fields = [
      ["Views", "view_count"],
      ["Likes", "like_count"],
      ["Comments", "comment_count"],
      ["Shares", "share_count"],
    ] as const;
    return Object.freeze(
      fields.map(([name, field]) =>
        Object.freeze({
          name,
          value: typeof video[field] === "number" ? video[field] : undefined,
        }),
      ),
    );
  }

  async #readConnection(
    token: Readonly<Record<string, unknown>>,
  ): Promise<ProviderConnection> {
    const accessToken = readProviderString(this.id, token["access_token"]);
    const scope = readProviderString(this.id, token["scope"]);
    const scopes = Object.freeze(
      scope.split(",").map((item) => item.trim()).filter((item) => item.length > 0),
    );
    if (TIKTOK_IDENTITY_SCOPES.some((item) => !scopes.includes(item))) {
      throw new ProviderRuntimeError(this.id, "auth_required");
    }
    const profileResponse = await this.#requestRecord(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,username",
      "GET",
      undefined,
      true,
      accessToken,
    );
    const profileData = readProviderRecord(this.id, profileResponse["data"]);
    const profile = readProviderRecord(this.id, profileData["user"]);

    return Object.freeze({
      provider: this.id,
      accountId: readProviderString(this.id, profile["open_id"]),
      accountName: readProviderString(this.id, profile["display_name"]),
      username:
        typeof profile["username"] === "string" ? profile["username"] : undefined,
      pictureUrl:
        typeof profile["avatar_url"] === "string" ? profile["avatar_url"] : undefined,
      accessToken,
      refreshToken: readProviderString(this.id, token["refresh_token"]),
      expiresInSeconds: readProviderNumber(this.id, token["expires_in"]),
      refreshExpiresInSeconds: readProviderNumber(
        this.id,
        token["refresh_expires_in"],
      ),
      scopes,
    });
  }

  #validatePublishRequest(request: TikTokPublishRequest): void {
    const requiredScope = request.mode === "direct" ? "video.publish" : "video.upload";
    if (
      request.accessToken.length === 0 ||
      !request.grantedScopes.includes(requiredScope) ||
      request.media.urls.length === 0 ||
      (request.media.kind === "photo" && request.media.urls.length > 35) ||
      (request.media.kind === "video" && Array.from(request.caption).length > 2_200) ||
      (request.media.kind === "photo" &&
        (Array.from(request.photoTitle ?? "").length > 90 ||
          Array.from(request.caption).length > 4_000))
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }

    for (const mediaUrl of request.media.urls) {
      try {
        const url = new URL(mediaUrl);
        if (
          url.protocol !== "https:" ||
          url.username.length > 0 ||
          url.password.length > 0 ||
          url.origin !== this.#verifiedMediaOrigin
        ) {
          throw new TypeError("Invalid media URL");
        }
      } catch {
        throw new ProviderRuntimeError(this.id, "invalid_request");
      }
    }

    if (request.mode !== "direct") {
      return;
    }
    const creator = request.creatorInfo;
    const now = this.#now();
    if (
      !request.consentConfirmed ||
      creator === undefined ||
      !Number.isSafeInteger(creator.fetchedAtEpochMilliseconds) ||
      creator.fetchedAtEpochMilliseconds > now ||
      now - creator.fetchedAtEpochMilliseconds >
        this.#creatorInfoMaximumAgeMilliseconds ||
      request.privacyLevel === undefined ||
      !creator.privacyLevelOptions.includes(request.privacyLevel) ||
      request.allowComment === undefined ||
      request.allowDuet === undefined ||
      request.allowStitch === undefined ||
      (creator.commentsDisabled && request.allowComment) ||
      (creator.duetDisabled && request.allowDuet) ||
      (creator.stitchDisabled && request.allowStitch) ||
      (request.media.kind === "video" &&
        request.media.durationSeconds > creator.maxVideoDurationSeconds)
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
  }

  #statusResult(
    kind: ProviderPublishResult["kind"],
    publishId: string,
    postIds: readonly string[],
  ): ProviderPublishResult {
    return Object.freeze({
      provider: this.id,
      kind,
      providerOperationId: publishId,
      remotePostIds: Object.freeze([...postIds]),
      remoteUrls: Object.freeze([]),
      visibility: undefined,
    });
  }

  #readRedirectUri(value: string): string {
    try {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        url.search.length > 0 ||
        url.hash.length > 0 ||
        url.username.length > 0 ||
        url.password.length > 0
      ) {
        throw new TypeError("Invalid callback");
      }
      return url.toString();
    } catch {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
  }

  async #requestRecord(
    url: string,
    method: "GET" | "POST",
    body?: URLSearchParams | string,
    expectsEnvelope = true,
    accessToken?: string,
  ): Promise<Readonly<Record<string, unknown>>> {
    const isForm = body instanceof URLSearchParams;
    const response = await executeProviderRequestWithResponse(this.#http, {
      provider: this.id,
      url,
      method,
      headers: {
        ...(body === undefined && method !== "POST"
          ? {}
          : {
              "Content-Type": isForm
                ? "application/x-www-form-urlencoded"
                : "application/json; charset=UTF-8",
            }),
        ...(accessToken === undefined
          ? {}
          : { Authorization: `Bearer ${accessToken}` }),
      },
      ...(body === undefined
        ? method === "POST"
          ? { body: "{}" }
          : {}
        : { body: isForm ? body.toString() : body }),
    });
    const record = readProviderRecord(this.id, response.body);
    if (expectsEnvelope) {
      const error = readProviderRecord(this.id, record["error"]);
      const code = readProviderString(this.id, error["code"]);
      if (code !== "ok") {
        if (code === "access_token_invalid") {
          throw new ProviderRuntimeError(this.id, "auth_required");
        }
        if (code === "rate_limit_exceeded") {
          throw new ProviderRuntimeError(
            this.id,
            "rate_limited",
            true,
            parseRetryAfterSeconds(response.headers["retry-after"]),
          );
        }
        if (code === "internal") {
          throw new ProviderRuntimeError(this.id, "transient_failure", true);
        }
        throw new ProviderRuntimeError(this.id, "rejected");
      }
    } else if (record["error"] !== undefined) {
      throw new ProviderRuntimeError(this.id, "auth_required");
    }
    return record;
  }
}
