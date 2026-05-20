import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateAvatarPhotos } from "@/lib/clipstitchr/client/generateAvatarPhotos";
import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";

const mocks = vi.hoisted(() => ({
  createBlobFromDataUrl: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/utils/createBlobFromDataUrl", () => ({
  createBlobFromDataUrl: mocks.createBlobFromDataUrl,
}));

const generatedVariant: AvatarGenerationVariant = {
  lighting: "studio",
  locationDescription: "in a bright studio",
  outfitDescription: "wearing a denim jacket",
  poseDescription: "holding the product",
  style: "ugc",
};

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
    mocks.createBlobFromDataUrl.mockResolvedValue(
      new Blob(["generated"], { type: "image/png" }),
    );
    vi.stubGlobal("fetch", vi.fn());
  });

  it("posts avatar generation form data and converts returned images", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createSuccessfulResponse({
        images: [
          {
            dataUrl: "data:image/png;base64,Zmlyc3Q=",
            mimeType: "image/png",
            variant: generatedVariant,
          },
        ],
        modelId: "avatar-model",
        prompts: ["studio prompt"],
      }),
    );

    const result = await generateAvatarPhotos({
      avatar: {
        blob: createAvatarBlob(),
        name: "reference",
      },
      avatarDescription: "A founder with short hair",
      context: "Launch post",
      count: 3,
      generationSpeedTier: "pro",
      identityMode: "similar",
      lighting: "studio",
      location: "office",
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
    expect((formData as FormData).get("context")).toBe("Launch post");
    expect((formData as FormData).get("count")).toBe("3");
    expect((formData as FormData).get("generationSpeedTier")).toBe("pro");
    expect((formData as FormData).get("identityMode")).toBe("similar");
    expect((formData as FormData).get("lighting")).toBe("studio");
    expect((formData as FormData).get("location")).toBe("office");
    expect((formData as FormData).get("style")).toBe("ugc");
    expect((formData as FormData).get("wardrobeStyle")).toBe("female");
    expect((formData as FormData).get("image")).toBeInstanceOf(File);
    expect(mocks.createBlobFromDataUrl).toHaveBeenCalledWith(
      "data:image/png;base64,Zmlyc3Q=",
    );
    expect(result).toEqual({
      generatedPhotos: [
        {
          blob: expect.any(Blob),
          variant: generatedVariant,
        },
      ],
      modelId: "avatar-model",
      prompts: ["studio prompt"],
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
        avatarDescription: "Reference",
        context: "Context",
        count: 1,
        lighting: "natural",
        location: "kitchen",
        style: "selfie",
      }),
    ).rejects.toThrow("Generation quota exceeded.");
    expect(mocks.createBlobFromDataUrl).not.toHaveBeenCalled();
  });
});
