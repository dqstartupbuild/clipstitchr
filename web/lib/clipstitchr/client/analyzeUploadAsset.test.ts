import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeUploadAsset } from "@/lib/clipstitchr/client/analyzeUploadAsset";

function createResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

describe("analyzeUploadAsset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("posts upload analysis form data and trims normalized metadata", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createResponse({
        avatarDescription: " avatar ",
        locationDescription: " kitchen ",
        mainPersonDescription: " person ",
        name: " Launch clip ",
        outfitDescription: " hoodie ",
        poseDescription: " holding product ",
        productDescription: " product ",
        tags: [" Demo ", "demo", "", "Launch"],
        videoDescription: " video ",
      }),
    );

    const result = await analyzeUploadAsset({
      blob: new Blob(["video"], { type: "video/mp4" }),
      fallbackBlob: new Blob(["poster"], { type: "image/jpeg" }),
      mediaKind: "ugc-video",
      originalName: "original.mov",
      sourceSizeBytes: 123,
      sourceUrl: "https://r2.example/source.mp4",
    });

    expect(fetch).toHaveBeenCalledWith("/api/uploads/analyze", {
      body: expect.any(FormData),
      method: "POST",
    });
    const formData = vi.mocked(fetch).mock.calls[0][1]?.body;

    expect((formData as FormData).get("file")).toBeInstanceOf(File);
    expect((formData as FormData).get("fallbackImage")).toBeInstanceOf(File);
    expect((formData as FormData).get("mediaKind")).toBe("ugc-video");
    expect((formData as FormData).get("originalName")).toBe("original.mov");
    expect((formData as FormData).get("sourceSizeBytes")).toBe("123");
    expect((formData as FormData).get("sourceUrl")).toBe(
      "https://r2.example/source.mp4",
    );
    expect(result).toEqual({
      avatarDescription: "avatar",
      locationDescription: "kitchen",
      mainPersonDescription: "person",
      name: "Launch clip",
      outfitDescription: "hoodie",
      poseDescription: "holding product",
      productDescription: "product",
      tags: ["demo", "launch"],
      videoDescription: "video",
    });
  });

  it("uses fallback names and empty tags when optional metadata is absent", async () => {
    vi.mocked(fetch).mockResolvedValue(createResponse({ name: " " }));

    await expect(
      analyzeUploadAsset({
        mediaKind: "photo",
        originalName: "Founder Shot.PNG",
      }),
    ).resolves.toMatchObject({
      name: "Founder Shot",
      tags: [],
    });
  });

  it("throws the server message when analysis fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createResponse({ message: "Analysis quota exceeded." }, 429),
    );

    await expect(
      analyzeUploadAsset({
        mediaKind: "photo",
        originalName: "photo.jpg",
      }),
    ).rejects.toThrow("Analysis quota exceeded.");
  });
});
