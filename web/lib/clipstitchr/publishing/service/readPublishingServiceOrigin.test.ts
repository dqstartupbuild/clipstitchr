import { afterEach, describe, expect, it, vi } from "vitest";

import { readPublishingServiceOrigin } from "@/lib/clipstitchr/publishing/service/readPublishingServiceOrigin";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("readPublishingServiceOrigin", () => {
  it("accepts an origin-only HTTPS service URL", () => {
    vi.stubEnv(
      "STUDIO_PUBLISHING_SERVICE_ORIGIN",
      "https://publishing.clipstitchr.com",
    );
    expect(readPublishingServiceOrigin()).toBe(
      "https://publishing.clipstitchr.com",
    );
  });

  it("rejects credentials, paths, and production HTTP", () => {
    vi.stubEnv("NODE_ENV", "production");

    for (const value of [
      "https://user:secret@publishing.clipstitchr.com",
      "https://publishing.clipstitchr.com/private",
      "http://publishing.clipstitchr.com",
    ]) {
      vi.stubEnv("STUDIO_PUBLISHING_SERVICE_ORIGIN", value);
      expect(() => readPublishingServiceOrigin()).toThrow();
    }
  });
});
