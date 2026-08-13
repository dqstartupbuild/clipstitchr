import { afterEach, describe, expect, it, vi } from "vitest";
import { startPublishingConnection } from "./startPublishingConnection";

describe("startPublishingConnection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns providers to the canonical Product publishing connections route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await startPublishingConnection("youtube");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/studio/publishing/integrations/youtube/connect",
      expect.objectContaining({
        body: JSON.stringify({
          returnPath: "/dashboard/studio/publishing/connections",
        }),
      }),
    );
  });
});
