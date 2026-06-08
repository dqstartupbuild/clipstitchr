import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateAvatarPhotos } from "@/lib/clipstitchr/client/generateAvatarPhotos";

function createAvatarBlob() {
  return new Blob(["avatar"], { type: "image/png" });
}

function createSuccessfulResponse(body: object) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

describe("generateAvatarPhotos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("posts avatar generation form data and returns the queued worker job", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createSuccessfulResponse({
        job: { id: "provider:avatar-photo:source_1", status: "queued" },
        modelId: "avatar-model",
        queuedCount: 3,
      }),
    );

    const result = await generateAvatarPhotos({
      avatar: {
        blob: createAvatarBlob(),
        name: "reference",
      },
      avatarId: "avatar_1",
      avatarName: "Founder",
      avatarDescription: "A founder with short hair",
      context: "Launch post",
      count: 3,
      generationSpeedTier: "pro",
      identityMode: "similar",
      lighting: "studio",
      location: "office",
      outfit: "navy activewear",
      style: "ugc",
      wardrobeStyle: "female",
    });

    expect(fetch).toHaveBeenCalledWith("/api/avatars/photos/generate", {
      body: expect.any(FormData),
      method: "POST",
    });
    const formData = vi.mocked(fetch).mock.calls[0][1]?.body;
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("avatarDescription")).toBe(
      "A founder with short hair",
    );
    expect((formData as FormData).get("avatarId")).toBe("avatar_1");
    expect((formData as FormData).get("avatarName")).toBe("Founder");
    expect((formData as FormData).get("context")).toBe("Launch post");
    expect((formData as FormData).get("count")).toBe("3");
    expect((formData as FormData).get("generationSpeedTier")).toBe("pro");
    expect((formData as FormData).get("identityMode")).toBe("similar");
    expect((formData as FormData).get("lighting")).toBe("studio");
    expect((formData as FormData).get("location")).toBe("office");
    expect((formData as FormData).get("outfit")).toBe("navy activewear");
    expect((formData as FormData).get("style")).toBe("ugc");
    expect((formData as FormData).get("wardrobeStyle")).toBe("female");
    expect((formData as FormData).get("image")).toBeInstanceOf(File);
    expect(result).toEqual({
      generatedPhotos: [],
      job: { id: "provider:avatar-photo:source_1", status: "queued" },
      modelId: "avatar-model",
      queuedCount: 3,
    });
  });

  it("uses default identity and wardrobe options", async () => {
    vi.mocked(fetch).mockResolvedValue(createSuccessfulResponse({}));

    await generateAvatarPhotos({
      avatar: {
        blob: new Blob(["avatar"]),
        mimeType: "image/jpeg",
        name: "reference",
      },
      avatarId: "avatar_1",
      avatarName: "Founder",
      avatarDescription: "Reference",
      context: "Context",
      count: 1,
      lighting: "natural",
      location: "kitchen",
      style: "selfie",
    });

    const formData = vi.mocked(fetch).mock.calls[0][1]?.body;

    expect((formData as FormData).get("identityMode")).toBe("same");
    expect((formData as FormData).get("generationSpeedTier")).toBeNull();
    expect((formData as FormData).get("outfit")).toBe("");
    expect((formData as FormData).get("wardrobeStyle")).toBe("any");
    expect((formData as FormData).get("image")).toBeInstanceOf(File);
  });

  it("throws the server message when generation fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Generation quota exceeded." }), {
        headers: { "content-type": "application/json" },
        status: 429,
      }),
    );

    await expect(
      generateAvatarPhotos({
        avatar: {
          blob: createAvatarBlob(),
          name: "reference",
        },
        avatarId: "avatar_1",
        avatarName: "Founder",
        avatarDescription: "Reference",
        context: "Context",
        count: 1,
        lighting: "natural",
        location: "kitchen",
        style: "selfie",
      }),
    ).rejects.toThrow("Generation quota exceeded.");
  });
});
