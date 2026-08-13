import { describe, expect, it } from "vitest";

import { ProviderRuntimeError } from "../src/provider-runtime/errors/ProviderRuntimeError.js";
import { InstagramFacebookProviderAdapter } from "../src/provider-runtime/instagram/InstagramFacebookProviderAdapter.js";
import { InstagramPublishingClient } from "../src/provider-runtime/instagram/InstagramPublishingClient.js";
import { InstagramStandaloneProviderAdapter } from "../src/provider-runtime/instagram/InstagramStandaloneProviderAdapter.js";
import { createMetaGraphVersion } from "../src/provider-runtime/instagram/createMetaGraphVersion.js";
import { createPublishingProviderRuntimeRegistry } from "../src/provider-runtime/registry/createPublishingProviderRuntimeRegistry.js";
import type { PublishingProviderRuntime } from "../src/provider-runtime/registry/PublishingProviderRuntime.js";
import { TikTokProviderAdapter } from "../src/provider-runtime/tiktok/TikTokProviderAdapter.js";
import { YouTubeProviderAdapter } from "../src/provider-runtime/youtube/YouTubeProviderAdapter.js";
import type { YouTubeUploadTransport } from "../src/provider-runtime/youtube/YouTubeUploadTransport.js";
import { FakeProviderHttpClient } from "./support/FakeProviderHttpClient.js";

const createRuntimes = () => {
  const http = new FakeProviderHttpClient([]);
  const graphVersion = createMetaGraphVersion("v26.0");
  const publishing = new InstagramPublishingClient({
    provider: "instagram",
    graphHost: "graph.facebook.com",
    graphVersion,
    http,
  });
  return [
    new InstagramFacebookProviderAdapter({
      appId: "instagram-app",
      appSecret: "instagram-secret-placeholder",
      graphVersion,
      http,
      publishing,
    }),
    new TikTokProviderAdapter({
      clientId: "tiktok-client",
      clientSecret: "tiktok-secret-placeholder",
      http,
      verifiedMediaOrigin: "https://media.clipstitchr.invalid",
      verifyPullMediaUrl: async () => true,
    }),
  ] as const;
};

describe("publishing provider runtime registry", () => {
  it("contains the configured Instagram and TikTok runtimes", () => {
    const registry = createPublishingProviderRuntimeRegistry(createRuntimes());
    expect([...registry.keys()]).toEqual(["instagram", "tiktok"]);
  });

  it("includes YouTube in the provider runtime inventory", () => {
    const upload: YouTubeUploadTransport = {
      initiate: async () => "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=test",
      probe: async () => ({ kind: "active", committedOffset: 0 }),
      uploadRange: async () => ({ kind: "active", committedOffset: 0 }),
      uploadThumbnail: async () => undefined,
    };
    const registry = createPublishingProviderRuntimeRegistry([
      ...createRuntimes(),
      new YouTubeProviderAdapter({
        clientId: "google-client",
        clientSecret: "google-client-secret",
        http: new FakeProviderHttpClient([]),
        upload,
      }),
    ]);

    expect([...registry.keys()]).toEqual(["instagram", "tiktok", "youtube"]);
  });

  it("accepts the direct Instagram login path without the Facebook adapter", () => {
    const http = new FakeProviderHttpClient([]);
    const graphVersion = createMetaGraphVersion("v26.0");
    const registry = createPublishingProviderRuntimeRegistry([
      new InstagramStandaloneProviderAdapter({
        appId: "instagram-app",
        appSecret: "instagram-secret-placeholder",
        graphVersion,
        http,
        publishing: new InstagramPublishingClient({
          provider: "instagram-standalone",
          graphHost: "graph.instagram.com",
          graphVersion,
          http,
        }),
      }),
      createRuntimes()[1],
    ]);

    expect([...registry.keys()]).toEqual(["instagram-standalone", "tiktok"]);
  });

  it("rejects an excluded provider even when a caller defeats the type", () => {
    const excluded = {
      id: "vimeo",
      createAuthorizationUrl: () => "https://vimeo.invalid",
    } as unknown as PublishingProviderRuntime;
    expect(() =>
      createPublishingProviderRuntimeRegistry([...createRuntimes(), excluded]),
    ).toThrow(ProviderRuntimeError);
  });

  it("fails closed without an explicit Meta Graph version", () => {
    expect(() => createMetaGraphVersion("latest")).toThrow(ProviderRuntimeError);
  });
});
