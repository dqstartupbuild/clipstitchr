import { assertOAuthStateToken } from "../../oauth/assertOAuthStateToken.js";
import type { ProviderAnalyticsMetric } from "../contracts/ProviderAnalyticsMetric.js";
import type { ProviderConnection } from "../contracts/ProviderConnection.js";
import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import { executeProviderRequestWithResponse } from "../http/executeProviderRequestWithResponse.js";
import type { ProviderHttpClient } from "../http/ProviderHttpClient.js";
import { readProviderNumber } from "../parsing/readProviderNumber.js";
import { readProviderRecord } from "../parsing/readProviderRecord.js";
import { readProviderString } from "../parsing/readProviderString.js";
import type { YouTubeUploadTransport } from "./YouTubeUploadTransport.js";

type YouTubeProviderAdapterOptions = Readonly<{
  clientId: string;
  clientSecret: string;
  http: ProviderHttpClient;
  upload: YouTubeUploadTransport;
}>;

const YOUTUBE_SCOPES = Object.freeze([
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
]);

export class YouTubeProviderAdapter {
  readonly id = "youtube" as const;
  readonly pkceMode = "rfc7636-s256" as const;
  readonly #clientId: string;
  readonly #clientSecret: string;
  readonly #http: ProviderHttpClient;
  readonly #upload: YouTubeUploadTransport;

  constructor(options: YouTubeProviderAdapterOptions) {
    if (options.clientId.length < 1 || options.clientSecret.length < 12) {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
    this.#clientId = options.clientId;
    this.#clientSecret = options.clientSecret;
    this.#http = options.http;
    this.#upload = options.upload;
  }

  createAuthorizationUrl(
    state: string,
    redirectUri: string,
    pkce?: Readonly<{ codeChallenge: string; codeChallengeMethod: "S256" }>,
  ): string {
    assertOAuthStateToken(state);
    if (
      pkce === undefined ||
      pkce.codeChallengeMethod !== "S256" ||
      !/^[A-Za-z0-9_-]{43}$/u.test(pkce.codeChallenge)
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      access_type: "offline",
      client_id: this.#clientId,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: "S256",
      include_granted_scopes: "true",
      prompt: "consent",
      redirect_uri: this.#readRedirectUri(redirectUri),
      response_type: "code",
      scope: YOUTUBE_SCOPES.join(" "),
      state,
    }).toString();
    return url.toString();
  }

  async exchangeAuthorizationCode(
    code: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<ProviderConnection> {
    if (
      code.length < 1 ||
      code.length > 4_096 ||
      codeVerifier === undefined ||
      !/^[A-Za-z0-9._~-]{43,128}$/u.test(codeVerifier)
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const token = await this.#requestRecord(
      "https://oauth2.googleapis.com/token",
      "POST",
      new URLSearchParams({
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: this.#readRedirectUri(redirectUri),
      }),
    );
    const refreshToken = readProviderString(this.id, token["refresh_token"]);
    return this.#readConnection(token, refreshToken);
  }

  async refreshConnection(
    refreshToken: string,
    expectedChannelId?: string,
  ): Promise<ProviderConnection> {
    if (refreshToken.length < 1 || refreshToken.length > 16_384) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const token = await this.#requestRecord(
      "https://oauth2.googleapis.com/token",
      "POST",
      new URLSearchParams({
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    );
    return this.#readConnection(token, refreshToken, expectedChannelId);
  }

  async listYouTubeChannels(
    connection: ProviderConnection,
  ): Promise<readonly ProviderConnection[]> {
    if (
      connection.provider !== "youtube" ||
      connection.accessToken.length < 1 ||
      connection.refreshToken === undefined
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const channels = await this.#readChannels(connection.accessToken);
    return Object.freeze(
      channels.map((channel) =>
        this.#mapChannelConnection(
          channel,
          connection,
          connection.accountName,
          connection.pictureUrl,
        ),
      ),
    );
  }

  initiateUpload: YouTubeUploadTransport["initiate"] = (input) =>
    this.#upload.initiate(input);

  probeUpload: YouTubeUploadTransport["probe"] = (input) =>
    this.#upload.probe(input);

  uploadRange: YouTubeUploadTransport["uploadRange"] = (input) =>
    this.#upload.uploadRange(input);

  uploadThumbnail: YouTubeUploadTransport["uploadThumbnail"] = (input) =>
    this.#upload.uploadThumbnail(input);

  async getPostAnalytics(
    accessToken: string,
    videoId: string,
  ): Promise<readonly ProviderAnalyticsMetric[]> {
    this.#assertCredential(accessToken);
    if (!/^[A-Za-z0-9_-]{1,128}$/u.test(videoId)) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const query = new URLSearchParams({
      id: videoId,
      part: "statistics",
    });
    const response = await this.#requestRecord(
      `https://youtube.googleapis.com/youtube/v3/videos?${query.toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const items = response["items"];
    if (!Array.isArray(items)) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }
    if (items.length === 0) {
      return Object.freeze([]);
    }
    const statistics = readProviderRecord(
      this.id,
      readProviderRecord(this.id, items[0])["statistics"],
    );
    return Object.freeze(
      [
        ["Views", "viewCount"],
        ["Likes", "likeCount"],
        ["Comments", "commentCount"],
        ["Favorites", "favoriteCount"],
      ].map(([name, key]) =>
        Object.freeze({ name: name!, value: this.#readMetric(statistics[key!]) }),
      ),
    );
  }

  async getAccountAnalytics(
    accessToken: string,
    startDate: string,
    endDate: string,
  ): Promise<readonly ProviderAnalyticsMetric[]> {
    this.#assertCredential(accessToken);
    if (
      !/^\d{4}-\d{2}-\d{2}$/u.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(endDate) ||
      startDate > endDate
    ) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
    }
    const metricNames = [
      "views",
      "estimatedMinutesWatched",
      "averageViewDuration",
      "averageViewPercentage",
      "subscribersGained",
      "likes",
      "subscribersLost",
    ] as const;
    const query = new URLSearchParams({
      dimensions: "day",
      endDate,
      ids: "channel==MINE",
      metrics: metricNames.join(","),
      sort: "day",
      startDate,
    });
    const response = await this.#requestRecord(
      `https://youtubeanalytics.googleapis.com/v2/reports?${query.toString()}`,
      "GET",
      undefined,
      accessToken,
    );
    const headers = response["columnHeaders"];
    const rows = response["rows"];
    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }
    const names = headers.map((header) =>
      readProviderString(this.id, readProviderRecord(this.id, header)["name"]),
    );
    return Object.freeze(
      metricNames.map((metricName) => {
        const index = names.indexOf(metricName);
        const values = rows
          .map((row) => (Array.isArray(row) ? row[index] : undefined))
          .map((value) =>
            typeof value === "number"
              ? value
              : typeof value === "string"
                ? Number(value)
                : Number.NaN,
          )
          .filter(Number.isFinite);
        const average = metricName === "averageViewDuration" ||
          metricName === "averageViewPercentage";
        const value = values.length === 0
          ? undefined
          : values.reduce((total, entry) => total + entry, 0) /
            (average ? values.length : 1);
        return Object.freeze({ name: metricName, value });
      }),
    );
  }

  async #readConnection(
    token: Readonly<Record<string, unknown>>,
    refreshToken: string,
    expectedChannelId?: string,
  ): Promise<ProviderConnection> {
    const accessToken = readProviderString(this.id, token["access_token"]);
    const expiresInSeconds = readProviderNumber(this.id, token["expires_in"]);
    const scopeValue = typeof token["scope"] === "string"
      ? token["scope"]
      : YOUTUBE_SCOPES.join(" ");
    const scopes = Object.freeze(
      scopeValue.split(/\s+/u).filter((scope) => scope.length > 0),
    );
    if (YOUTUBE_SCOPES.some((scope) => !scopes.includes(scope))) {
      throw new ProviderRuntimeError(this.id, "auth_required");
    }
    const [profile, channels] = await Promise.all([
      this.#requestRecord(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        "GET",
        undefined,
        accessToken,
      ),
      this.#readChannels(accessToken),
    ]);
    if (channels.length < 1) {
      throw new ProviderRuntimeError(this.id, "rejected");
    }
    const channel = expectedChannelId === undefined
      ? channels[0]!
      : channels.find((candidate) => candidate["id"] === expectedChannelId);
    if (channel === undefined) {
      throw new ProviderRuntimeError(this.id, "auth_required");
    }
    const base = Object.freeze({
      provider: this.id,
      accountId: readProviderString(this.id, channel["id"]),
      accountName: "YouTube channel",
      username: undefined,
      pictureUrl: undefined,
      accessToken,
      refreshToken,
      expiresInSeconds,
      refreshExpiresInSeconds: undefined,
      scopes,
    });
    return this.#mapChannelConnection(
      channel,
      base,
      typeof profile["name"] === "string" ? profile["name"] : "YouTube channel",
      typeof profile["picture"] === "string" ? profile["picture"] : undefined,
    );
  }

  async #readChannels(
    accessToken: string,
  ): Promise<readonly Readonly<Record<string, unknown>>[]> {
    const response = await this.#requestRecord(
      "https://youtube.googleapis.com/youtube/v3/channels?part=id%2Csnippet&mine=true&maxResults=50",
      "GET",
      undefined,
      accessToken,
    );
    const items = response["items"];
    if (!Array.isArray(items) || items.length > 50) {
      throw new ProviderRuntimeError(this.id, "invalid_response");
    }
    return Object.freeze(
      items
        .map((item) => readProviderRecord(this.id, item))
        .sort((left, right) =>
          readProviderString(this.id, left["id"]).localeCompare(
            readProviderString(this.id, right["id"]),
          ),
        ),
    );
  }

  #mapChannelConnection(
    channel: Readonly<Record<string, unknown>>,
    base: ProviderConnection,
    fallbackName: string,
    fallbackPictureUrl: string | undefined,
  ): ProviderConnection {
    const snippet = readProviderRecord(this.id, channel["snippet"]);
    const thumbnails = typeof snippet["thumbnails"] === "object" &&
      snippet["thumbnails"] !== null
      ? snippet["thumbnails"] as Readonly<Record<string, unknown>>
      : {};
    const defaultThumbnail = typeof thumbnails["default"] === "object" &&
      thumbnails["default"] !== null
      ? thumbnails["default"] as Readonly<Record<string, unknown>>
      : {};
    return Object.freeze({
      ...base,
      accountId: readProviderString(this.id, channel["id"]),
      accountName:
        typeof snippet["title"] === "string" && snippet["title"].trim().length > 0
          ? snippet["title"].trim()
          : fallbackName.trim() || "YouTube channel",
      username:
        typeof snippet["customUrl"] === "string" ? snippet["customUrl"] : undefined,
      pictureUrl:
        typeof defaultThumbnail["url"] === "string"
          ? defaultThumbnail["url"]
          : fallbackPictureUrl,
    });
  }

  async #requestRecord(
    url: string,
    method: "GET" | "POST",
    body?: URLSearchParams,
    accessToken?: string,
  ): Promise<Readonly<Record<string, unknown>>> {
    const response = await executeProviderRequestWithResponse(this.#http, {
      provider: this.id,
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
    const record = readProviderRecord(this.id, response.body);
    if (record["error"] !== undefined) {
      throw new ProviderRuntimeError(this.id, "rejected");
    }
    return record;
  }

  #readMetric(value: unknown): number | undefined {
    const number = typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
    return Number.isFinite(number) && number >= 0 ? number : undefined;
  }

  #assertCredential(accessToken: string): void {
    if (accessToken.length < 1 || accessToken.length > 16_384) {
      throw new ProviderRuntimeError(this.id, "invalid_request");
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
        throw new TypeError("Invalid redirect URI");
      }
      return url.toString();
    } catch {
      throw new ProviderRuntimeError(this.id, "invalid_configuration");
    }
  }
}
