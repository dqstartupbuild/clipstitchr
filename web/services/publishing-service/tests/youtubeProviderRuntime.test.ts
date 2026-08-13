import { describe, expect, it, vi } from "vitest";

import { YouTubeProviderAdapter } from "../src/provider-runtime/youtube/YouTubeProviderAdapter.js";
import type { YouTubeUploadTransport } from "../src/provider-runtime/youtube/YouTubeUploadTransport.js";
import { validateYouTubeResumableSessionUri } from "../src/provider-runtime/youtube/validateYouTubeResumableSessionUri.js";
import { FakeProviderHttpClient } from "./support/FakeProviderHttpClient.js";

const response = (body: unknown, headers = {}) => ({
  status: 200,
  headers,
  body,
});

const createUpload = (): YouTubeUploadTransport => ({
  initiate: vi.fn(),
  probe: vi.fn(),
  uploadRange: vi.fn(),
  uploadThumbnail: vi.fn(),
});

describe("YouTubeProviderAdapter", () => {
  it("binds Google OAuth to S256 PKCE and returns durable channel identities", async () => {
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtubepartner",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ].join(" ");
    const http = new FakeProviderHttpClient([
      response({
        access_token: "access-secret",
        refresh_token: "refresh-secret",
        expires_in: 3_600,
        scope: scopes,
      }),
      response({ id: "google-profile", name: "Creator", picture: "https://images.example/profile.jpg" }),
      response({
        items: [
          {
            id: "channel_b",
            snippet: { title: "Channel B" },
          },
          {
            id: "channel_a",
            snippet: {
              title: "Channel A",
              customUrl: "@channel-a",
              thumbnails: { default: { url: "https://images.example/channel-a.jpg" } },
            },
          },
        ],
      }),
      response({
        items: [
          { id: "channel_b", snippet: { title: "Channel B" } },
          { id: "channel_a", snippet: { title: "Channel A" } },
        ],
      }),
    ]);
    const runtime = new YouTubeProviderAdapter({
      clientId: "google-client",
      clientSecret: "google-client-secret",
      http,
      upload: createUpload(),
    });
    const authorization = new URL(
      runtime.createAuthorizationUrl(
        "s".repeat(43),
        "https://app.example/api/studio/publishing/oauth/youtube/callback",
        { codeChallenge: "c".repeat(43), codeChallengeMethod: "S256" },
      ),
    );
    expect(authorization.origin).toBe("https://accounts.google.com");
    expect(authorization.searchParams.get("access_type")).toBe("offline");
    expect(authorization.searchParams.get("prompt")).toBe("consent");
    expect(authorization.searchParams.get("code_challenge_method")).toBe("S256");
    expect(authorization.searchParams.has("client_secret")).toBe(false);

    const connection = await runtime.exchangeAuthorizationCode(
      "authorization-code",
      "https://app.example/api/studio/publishing/oauth/youtube/callback",
      "v".repeat(43),
    );
    expect(connection).toMatchObject({
      provider: "youtube",
      accountId: "channel_a",
      accountName: "Channel A",
      refreshToken: "refresh-secret",
      username: "@channel-a",
    });
    const channels = await runtime.listYouTubeChannels(connection);
    expect(channels.map(({ accountId }) => accountId)).toEqual([
      "channel_a",
      "channel_b",
    ]);
    expect(JSON.stringify(channels)).not.toContain("code_verifier");
    expect(http.requests[0]?.url).toBe("https://oauth2.googleapis.com/token");
    expect(http.requests[0]?.body).toContain("code_verifier=");
  });

  it("normalizes official video and account analytics metrics", async () => {
    const http = new FakeProviderHttpClient([
      response({
        items: [
          {
            statistics: {
              viewCount: "120",
              likeCount: "9",
              commentCount: "3",
              favoriteCount: "0",
            },
          },
        ],
      }),
      response({
        columnHeaders: [
          { name: "day" },
          { name: "views" },
          { name: "estimatedMinutesWatched" },
          { name: "averageViewDuration" },
          { name: "averageViewPercentage" },
          { name: "subscribersGained" },
          { name: "likes" },
          { name: "subscribersLost" },
        ],
        rows: [
          ["2026-08-10", 10, 20, 30, 40, 2, 4, 1],
          ["2026-08-11", 15, 25, 50, 60, 3, 5, 0],
        ],
      }),
    ]);
    const runtime = new YouTubeProviderAdapter({
      clientId: "google-client",
      clientSecret: "google-client-secret",
      http,
      upload: createUpload(),
    });
    await expect(runtime.getPostAnalytics("access", "video_1")).resolves.toEqual([
      { name: "Views", value: 120 },
      { name: "Likes", value: 9 },
      { name: "Comments", value: 3 },
      { name: "Favorites", value: 0 },
    ]);
    await expect(
      runtime.getAccountAnalytics("access", "2026-08-10", "2026-08-11"),
    ).resolves.toEqual([
      { name: "views", value: 25 },
      { name: "estimatedMinutesWatched", value: 45 },
      { name: "averageViewDuration", value: 40 },
      { name: "averageViewPercentage", value: 50 },
      { name: "subscribersGained", value: 5 },
      { name: "likes", value: 9 },
      { name: "subscribersLost", value: 1 },
    ]);
    expect(new URL(http.requests[1]!.url).origin).toBe(
      "https://youtubeanalytics.googleapis.com",
    );
  });

  it("accepts only the exact Google resumable upload host and path", () => {
    const valid =
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&upload_id=session_1&part=id%2Csnippet%2Cstatus&notifySubscribers=true";
    expect(validateYouTubeResumableSessionUri(valid)).toBe(valid);
    for (const invalid of [
      "https://evil.example/upload/youtube/v3/videos?upload_id=session_1",
      "https://www.googleapis.com/upload/youtube/v3/thumbnails?upload_id=session_1",
      "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=",
      "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=session_1&redirect=https://evil.example",
    ]) {
      expect(() => validateYouTubeResumableSessionUri(invalid)).toThrow();
    }
  });
});
