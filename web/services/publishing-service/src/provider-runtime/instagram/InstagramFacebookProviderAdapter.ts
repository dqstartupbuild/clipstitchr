import type { ProviderConnection } from "../contracts/ProviderConnection.js";
import type { ProviderAnalyticsMetric } from "../contracts/ProviderAnalyticsMetric.js";
import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import { executeProviderRequest } from "../http/executeProviderRequest.js";
import type { ProviderHttpClient } from "../http/ProviderHttpClient.js";
import { readProviderNumber } from "../parsing/readProviderNumber.js";
import { readProviderRecord } from "../parsing/readProviderRecord.js";
import { readProviderString } from "../parsing/readProviderString.js";
import { assertOAuthStateToken } from "../../oauth/assertOAuthStateToken.js";
import type { InstagramAccountSelection } from "./InstagramAccountSelection.js";
import type { InstagramPublishingClient } from "./InstagramPublishingClient.js";
import type { InstagramPublishCheckpoint } from "./InstagramPublishCheckpoint.js";
import type { InstagramPublishProgress } from "./InstagramPublishProgress.js";
import type { InstagramPublishRequest } from "./InstagramPublishRequest.js";
import type { MetaGraphVersion } from "./MetaGraphVersion.js";

type InstagramFacebookProviderAdapterOptions = Readonly<{
  appId: string;
  appSecret: string;
  graphVersion: MetaGraphVersion;
  http: ProviderHttpClient;
  publishing: InstagramPublishingClient;
}>;

const FACEBOOK_PUBLISH_SCOPES = Object.freeze([
  "instagram_basic",
  "instagram_content_publish",
  "pages_read_engagement",
  "pages_show_list",
]);

export class InstagramFacebookProviderAdapter {
  readonly id = "instagram" as const;
  readonly #appId: string;
  readonly #appSecret: string;
  readonly #graphVersion: MetaGraphVersion;
  readonly #http: ProviderHttpClient;
  readonly #publishing: InstagramPublishingClient;

  constructor(options: InstagramFacebookProviderAdapterOptions) {
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
    const url = new URL(
      `https://www.facebook.com/${this.#graphVersion}/dialog/oauth`,
    );
    url.search = new URLSearchParams({
      client_id: this.#appId,
      redirect_uri: callback,
      response_type: "code",
      scope: FACEBOOK_PUBLISH_SCOPES.join(","),
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
      `https://graph.facebook.com/${this.#graphVersion}/oauth/access_token`,
      "POST",
      new URLSearchParams({
        client_id: this.#appId,
        client_secret: this.#appSecret,
        redirect_uri: callback,
        code,
      }),
    );
    const shortAccessToken = readProviderString(
      this.id,
      shortToken["access_token"],
    );
    const longToken = await this.#requestRecord(
      `https://graph.facebook.com/${this.#graphVersion}/oauth/access_token`,
      "POST",
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: this.#appId,
        client_secret: this.#appSecret,
        fb_exchange_token: shortAccessToken,
      }),
    );
    const accessToken = readProviderString(this.id, longToken["access_token"]);
    const expiresInSeconds = readProviderNumber(
      this.id,
      longToken["expires_in"],
    );
    const permissions = await this.#readGrantedPermissions(accessToken);
    this.#assertScopes(permissions, FACEBOOK_PUBLISH_SCOPES);
    const profile = await this.#requestRecord(
      `https://graph.facebook.com/${this.#graphVersion}/me?${new URLSearchParams({
        fields: "id,name,picture",
      }).toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const picture = profile["picture"];
    const pictureData =
      picture === undefined
        ? undefined
        : readProviderRecord(this.id, picture)["data"];
    const pictureUrl =
      pictureData === undefined
        ? undefined
        : readProviderRecord(this.id, pictureData)["url"];

    return Object.freeze({
      provider: this.id,
      accountId: readProviderString(this.id, profile["id"]),
      accountName: readProviderString(this.id, profile["name"]),
      username: undefined,
      pictureUrl: typeof pictureUrl === "string" ? pictureUrl : undefined,
      accessToken,
      refreshToken: undefined,
      expiresInSeconds,
      refreshExpiresInSeconds: undefined,
      scopes: permissions,
    });
  }

  async listInstagramAccounts(
    userAccessToken: string,
  ): Promise<readonly InstagramAccountSelection[]> {
    if (userAccessToken.length === 0) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const accounts: InstagramAccountSelection[] = [];
    let nextUrl: string | undefined =
      `https://graph.facebook.com/${this.#graphVersion}/me/accounts?${new URLSearchParams(
        {
          fields: "id,name,access_token,instagram_business_account",
          limit: "100",
        },
      ).toString()}`;

    for (let page = 0; page < 10 && nextUrl !== undefined; page += 1) {
      const response = await this.#requestRecord(
        nextUrl,
        "GET",
        undefined,
        userAccessToken,
      );
      const data = response["data"];
      if (!Array.isArray(data)) {
        throw new ProviderRuntimeError(this.id, "invalid_response");
      }

      for (const entry of data) {
        const pageRecord = readProviderRecord(this.id, entry);
        if (pageRecord["instagram_business_account"] === undefined) {
          continue;
        }
        const instagramReference = readProviderRecord(
          this.id,
          pageRecord["instagram_business_account"],
        );
        const accountId = readProviderString(this.id, instagramReference["id"]);
        const details = await this.#requestRecord(
          `https://graph.facebook.com/${this.#graphVersion}/${encodeURIComponent(accountId)}?${new URLSearchParams(
            {
              fields: "id,name,username,profile_picture_url",
            },
          ).toString()}`,
          "GET",
          undefined,
          userAccessToken,
        );
        accounts.push(
          Object.freeze({
            accountId,
            pageId: readProviderString(this.id, pageRecord["id"]),
            accountName: readProviderString(this.id, details["name"]),
            username:
              typeof details["username"] === "string"
                ? details["username"]
                : undefined,
            pictureUrl:
              typeof details["profile_picture_url"] === "string"
                ? details["profile_picture_url"]
                : undefined,
            pageAccessToken: readProviderString(
              this.id,
              pageRecord["access_token"],
            ),
          }),
        );
      }

      const paging = response["paging"];
      const next =
        paging === undefined
          ? undefined
          : readProviderRecord(this.id, paging)["next"];
      nextUrl = typeof next === "string" ? next : undefined;
      if (nextUrl !== undefined) {
        const parsedNext = new URL(nextUrl);
        if (
          parsedNext.protocol !== "https:" ||
          parsedNext.hostname !== "graph.facebook.com"
        ) {
          throw new ProviderRuntimeError(this.id, "invalid_response");
        }
        parsedNext.searchParams.delete("access_token");
        nextUrl = parsedNext.toString();
      }
    }

    if (nextUrl !== undefined) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }
    return Object.freeze(accounts);
  }

  async refreshConnection(): Promise<never> {
    throw new ProviderRuntimeError(this.id, "auth_required");
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

  async #readGrantedPermissions(accessToken: string): Promise<readonly string[]> {
    const response = await this.#requestRecord(
      `https://graph.facebook.com/${this.#graphVersion}/me/permissions?${new URLSearchParams(
        {},
      ).toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const data = response["data"];
    if (!Array.isArray(data)) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }
    return Object.freeze(
      data.flatMap((entry) => {
        const permission = readProviderRecord(this.id, entry);
        return permission["status"] === "granted" &&
          typeof permission["permission"] === "string"
          ? [permission["permission"]]
          : [];
      }),
    );
  }

  #assertScopes(granted: readonly string[], required: readonly string[]): void {
    if (required.some((scope) => !granted.includes(scope))) {
      throw new ProviderRuntimeError(this.id, "auth_required");
    }
  }

  #readRedirectUri(value: string): string {
    try {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        url.username.length > 0 ||
        url.password.length > 0 ||
        url.search.length > 0 ||
        url.hash.length > 0
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
