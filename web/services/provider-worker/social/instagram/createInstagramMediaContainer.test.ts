import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInstagramMediaContainer } from "./createInstagramMediaContainer";

const mocks = vi.hoisted(() => ({
  createInstagramContainer: vi.fn(),
}));

vi.mock("./createInstagramContainer", () => ({
  createInstagramContainer: mocks.createInstagramContainer,
}));

describe("createInstagramMediaContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createInstagramContainer.mockResolvedValue({ id: "container_1" });
  });

  it("creates a Reel container for video", async () => {
    await createInstagramMediaContainer({
      accessToken: "access_token",
      accountId: "ig_account",
      caption: "A finished clip",
      isVideo: true,
      mediaUrls: ["https://media.example.com/video.mp4"],
      shareToFeed: true,
    });

    expect(mocks.createInstagramContainer).toHaveBeenCalledTimes(1);
    expect(mocks.createInstagramContainer).toHaveBeenCalledWith(
      "ig_account",
      "access_token",
      {
        caption: "A finished clip",
        media_type: "REELS",
        share_to_feed: "true",
        video_url: "https://media.example.com/video.mp4",
      },
    );
  });

  it("creates a single-image container without carousel fields", async () => {
    await createInstagramMediaContainer({
      accessToken: "access_token",
      accountId: "ig_account",
      caption: "One image",
      isVideo: false,
      mediaUrls: ["https://media.example.com/image.jpg"],
      shareToFeed: false,
    });

    expect(mocks.createInstagramContainer).toHaveBeenCalledTimes(1);
    expect(mocks.createInstagramContainer).toHaveBeenCalledWith(
      "ig_account",
      "access_token",
      {
        caption: "One image",
        image_url: "https://media.example.com/image.jpg",
      },
    );
  });

  it("creates ordered carousel children before the parent container", async () => {
    mocks.createInstagramContainer
      .mockResolvedValueOnce({ id: "child_1" })
      .mockResolvedValueOnce({ id: "child_2" })
      .mockResolvedValueOnce({ id: "carousel_1" });

    const result = await createInstagramMediaContainer({
      accessToken: "access_token",
      accountId: "ig_account",
      caption: "Two images",
      isVideo: false,
      mediaUrls: [
        "https://media.example.com/first.jpg",
        "https://media.example.com/second.jpg",
      ],
      shareToFeed: false,
    });

    expect(mocks.createInstagramContainer.mock.calls).toEqual([
      [
        "ig_account",
        "access_token",
        {
          image_url: "https://media.example.com/first.jpg",
          is_carousel_item: "true",
        },
      ],
      [
        "ig_account",
        "access_token",
        {
          image_url: "https://media.example.com/second.jpg",
          is_carousel_item: "true",
        },
      ],
      [
        "ig_account",
        "access_token",
        {
          caption: "Two images",
          children: "child_1,child_2",
          media_type: "CAROUSEL",
        },
      ],
    ]);
    expect(result).toEqual({ id: "carousel_1" });
  });
});
