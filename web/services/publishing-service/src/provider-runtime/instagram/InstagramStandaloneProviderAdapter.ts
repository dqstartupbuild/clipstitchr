import type { ProviderAnalyticsMetric } from "../contracts/ProviderAnalyticsMetric.js";
import type { ProviderConnection } from "../contracts/ProviderConnection.js";
import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import { executeProviderRequest } from "../http/executeProviderRequest.js";
import type { ProviderHttpClient } from "../http/ProviderHttpClient.js";
import { readProviderNumber } from "../parsing/readProviderNumber.js";
import { readProviderRecord } from "../parsing/readProviderRecord.js";
import { readProviderString } from "../parsing/readProviderString.js";
import { assertOAuthStateToken } from "../../oauth/assertOAuthStateToken.js";
import type { InstagramPublishingClient } from "./InstagramPublishingClient.js";
import type { InstagramPublishCheckpoint } from "./InstagramPublishCheckpoint.js";
import type { InstagramPublishProgress } from "./InstagramPublishProgress.js";
import type { InstagramPublishRequest } from "./InstagramPublishRequest.js";
import type { MetaGraphVersion } from "./MetaGraphVersion.js";

type InstagramStandaloneProviderAdapterOptions = Readonly<{
  appId: string;
  appSecret: string;
  graphVersion: MetaGraphVersion;
  http: ProviderHttpClient;
  publishing: InstagramPublishingClient;
}>;

const INSTAGRAM_PUBLISH_SCOPES = Object.freeze([
  "instagram_business_basic",
  "instagram_business_content_publish",
]);

export class InstagramStandaloneProviderAdapter {
  readonly id = "instagram-standalone" as const;
  readonly #appId: string;
  readonly #appSecret: string;
  readonly #graphVersion: MetaGraphVersion;
  readonly #http: ProviderHttpClient;
  readonly #publishing: InstagramPublishingClient;

  constructor(options: InstagramStandaloneProviderAdapterOptions) {
    if (options.appId.length === 0 || options.appSecret.length < 12) {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
    this.#appId = options.appId;
    this.#appSecret = options.appSecret;
    this.#graphVersion = options.graphVersion;
    this.#http = options.http;
    this.#publishing = options.publishing;
  }

  createAuthorizationUrl(state: string, redirectUri: string): string {
    assertOAuthStateToken(state);
    const callback = this.#readRedirectUri(redirectUri);
    const url = new URL("https://www.instagram.com/oauth/authorize");
    url.search = new URLSearchParams({
      enable_fb_login: "0",
      client_id: this.#appId,
      redirect_uri: callback,
      response_type: "code",
      scope: INSTAGRAM_PUBLISH_SCOPES.join(","),
      state,
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
    const callback = this.#readRedirectUri(redirectUri);
    const shortToken = await this.#requestRecord(
      "https://api.instagram.com/oauth/access_token",
      "POST",
      new URLSearchParams({
        client_id: this.#appId,
        client_secret: this.#appSecret,
        grant_type: "authorization_code",
        redirect_uri: callback,
        code,
      }),
    );
    const grantedScopes = this.#readGrantedScopes(shortToken["permissions"]);
    this.#assertPublishScopes(grantedScopes);
    const longToken = await this.#requestRecord(
      "https://graph.instagram.com/access_token",
      "POST",
      new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_id: this.#appId,
        client_secret: this.#appSecret,
      }),
      readProviderString(this.id, shortToken["access_token"]),
    );
    return this.#readConnection(longToken, grantedScopes);
  }

  async refreshConnection(accessToken: string): Promise<ProviderConnection> {
    if (accessToken.length === 0) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const token = await this.#requestRecord(
      "https://graph.instagram.com/refresh_access_token",
      "POST",
      new URLSearchParams({ grant_type: "ig_refresh_token" }),
      accessToken,
    );
    return this.#readConnection(token, INSTAGRAM_PUBLISH_SCOPES);
  }

  advancePublish(
    request: InstagramPublishRequest,
    checkpoint?: InstagramPublishCheckpoint,
  ): Promise<InstagramPublishProgress> {
    return this.#publishing.advancePublish(request, checkpoint);
  }

  getPostAnalytics(
    postId: string,
    accessToken: string,
    metrics: readonly string[],
  ): Promise<readonly ProviderAnalyticsMetric[]> {
    return this.#publishing.getPostAnalytics(postId, accessToken, metrics);
  }

  async #readConnection(
    token: Readonly<Record<string, unknown>>,
    scopes: readonly string[],
  ): Promise<ProviderConnection> {
    const accessToken = readProviderString(this.id, token["access_token"]);
    const expiresInSeconds = readProviderNumber(this.id, token["expires_in"]);
    const profile = await this.#requestRecord(
      `https://graph.instagram.com/${this.#graphVersion}/me?${new URLSearchParams({
        fields: "user_id,username,name,profile_picture_url",
      }).toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    return Object.freeze({
      provider: this.id,
      accountId: readProviderString(this.id, profile["user_id"]),
      accountName: readProviderString(this.id, profile["name"]),
      username:
        typeof profile["username"] === "string" ? profile["username"] : undefined,
      pictureUrl:
        typeof profile["profile_picture_url"] === "string"
          ? profile["profile_picture_url"]
          : undefined,
      accessToken,
      refreshToken: accessToken,
      expiresInSeconds,
      refreshExpiresInSeconds: undefined,
      scopes: Object.freeze([...scopes]),
    });
  }

  #readGrantedScopes(value: unknown): readonly string[] {
    if (typeof value === "string") {
      return Object.freeze(value.split(",").filter((scope) => scope.length > 0));
    }
    if (Array.isArray(value) && value.every((scope) => typeof scope === "string")) {
      return Object.freeze([...value]);
    }
    throw new ProviderRuntimeError(this.id, "invalid_response");
  }

  #assertPublishScopes(scopes: readonly string[]): void {
    if (INSTAGRAM_PUBLISH_SCOPES.some((scope) => !scopes.includes(scope))) {
      throw new ProviderRuntimeError(this.id, "auth_required");
    }
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
    body?: URLSearchParams,
    accessToken?: string,
  ): Promise<Readonly<Record<string, unknown>>> {
    const value = await executeProviderRequest(this.#http, {
      provider: this.id,
      url,
      method,
      ...(body === undefined
        ? {}
        : {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              ...(accessToken === undefined
                ? {}
                : { Authorization: `Bearer ${accessToken}` }),
            },
            body: body.toString(),
          }),
      ...(body === undefined && accessToken !== undefined
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : {}),
    });
    const record = readProviderRecord(this.id, value);
    if (record["error"] !== undefined) {
      throw new ProviderRuntimeError(this.id, "rejected");
    }
    return record;
  }
}
