import { describe, expect, it } from "vitest";

import { ProviderRuntimeError } from "../src/provider-runtime/errors/ProviderRuntimeError.js";
import { InstagramFacebookProviderAdapter } from "../src/provider-runtime/instagram/InstagramFacebookProviderAdapter.js";
import { InstagramPublishingClient } from "../src/provider-runtime/instagram/InstagramPublishingClient.js";
import { InstagramStandaloneProviderAdapter } from "../src/provider-runtime/instagram/InstagramStandaloneProviderAdapter.js";
import { createMetaGraphVersion } from "../src/provider-runtime/instagram/createMetaGraphVersion.js";
import { createPublishingProviderRuntimeRegistry } from "../src/provider-runtime/registry/createPublishingProviderRuntimeRegistry.js";
import type { PublishingProviderRuntime } from "../src/provider-runtime/registry/PublishingProviderRuntime.js";
import { TikTokProviderAdapter } from "../src/provider-runtime/tiktok/TikTokProviderAdapter.js";
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
  it("contains Instagram and TikTok only, with standalone optional", () => {
    const registry = createPublishingProviderRuntimeRegistry(createRuntimes());
    expect([...registry.keys()]).toEqual(["instagram", "tiktok"]);
    expect(registry.has("youtube" as never)).toBe(false);
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
      id: "youtube",
      createAuthorizationUrl: () => "https://youtube.invalid",
    } as unknown as PublishingProviderRuntime;
    expect(() =>
      createPublishingProviderRuntimeRegistry([...createRuntimes(), excluded]),
    ).toThrow(ProviderRuntimeError);
  });

  it("fails closed without an explicit Meta Graph version", () => {
    expect(() => createMetaGraphVersion("latest")).toThrow(ProviderRuntimeError);
  });
});
