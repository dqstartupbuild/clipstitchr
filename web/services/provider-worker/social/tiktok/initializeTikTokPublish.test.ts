import { afterEach, describe, expect, it, vi } from "vitest";
import { SocialOutcomeUnknownError } from "../SocialOutcomeUnknownError";
import { initializeTikTokPublish } from "./initializeTikTokPublish";

const controls = {
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  autoAddMusic: true,
  brandContentToggle: false,
  brandOrganicToggle: true,
  consentAcknowledged: true,
  privacyLevel: "SELF_ONLY",
};

describe("initializeTikTokPublish", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    {
      name: "direct video",
      publishMode: "direct" as const,
      isPhotoPost: false,
      endpoint: "/video/init/",
    },
    {
      name: "inbox video",
      publishMode: "draft" as const,
      isPhotoPost: false,
      endpoint: "/inbox/video/init/",
    },
  ])("builds the official $name request", async (testCase) => {
    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >(async () => Response.json({ data: { publish_id: "publish_1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await initializeTikTokPublish({
      accessToken: "token",
      caption: "Caption #tag",
      controls,
      mediaUrls: ["https://media.example.com/video"],
      publishMode: testCase.publishMode,
      title: "Title",
      isPhotoPost: testCase.isPhotoPost,
    });

    expect(fetchMock.mock.calls[0][0]).toContain(testCase.endpoint);
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(request.body));

    if (testCase.publishMode === "draft") {
      expect(body.post_info).toBeUndefined();
    } else {
      expect(body.post_info.privacy_level).toBe("SELF_ONLY");
    }
  });

  it.each([true, false])(
    "maps slideshow auto_add_music=%s",
    async (autoAddMusic) => {
      const fetchMock = vi.fn<
        (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
      >(async () => Response.json({ data: { publish_id: "publish_1" } }));
      vi.stubGlobal("fetch", fetchMock);

      await initializeTikTokPublish({
        accessToken: "token",
        caption: "Caption",
        controls: { ...controls, autoAddMusic },
        mediaUrls: ["https://media.example.com/one.jpg"],
        publishMode: "direct",
        title: "Title",
        isPhotoPost: true,
      });
      const request = fetchMock.mock.calls[0][1] as RequestInit;
      const body = JSON.parse(String(request.body));

      expect(body.post_mode).toBe("DIRECT_POST");
      expect(body.media_type).toBe("PHOTO");
      expect(body.post_info.auto_add_music).toBe(autoAddMusic);
      expect(body.post_info.disable_duet).toBeUndefined();
      expect(body.post_info.disable_stitch).toBeUndefined();
    },
  );

  it("marks an interrupted final request as outcome unknown", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("lost"))));

    await expect(
      initializeTikTokPublish({
        accessToken: "token",
        caption: "Caption",
        controls,
        mediaUrls: ["https://media.example.com/video"],
        publishMode: "direct",
        title: "Title",
        isPhotoPost: false,
      }),
    ).rejects.toBeInstanceOf(SocialOutcomeUnknownError);
  });
});
