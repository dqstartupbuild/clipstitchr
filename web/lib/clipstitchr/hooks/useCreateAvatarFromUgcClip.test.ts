import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateAvatarFromUgcClip } from "@/lib/clipstitchr/hooks/useCreateAvatarFromUgcClip";
import type { CreateAvatarFromUgcClipOptions } from "@/lib/clipstitchr/types/CreateAvatarFromUgcClipOptions";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  generateAvatarPhotos: vi.fn(),
  stateSetter: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [initialValue, mocks.stateSetter],
}));

vi.mock("@/lib/clipstitchr/client/generateAvatarPhotos", () => ({
  generateAvatarPhotos: mocks.generateAvatarPhotos,
}));

function createClip(overrides: Record<string, unknown> = {}) {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 12,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Founder testimonial",
    originalName: "founder.mp4",
    originalSize: 100,
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/clips/clip_1.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  } as unknown as VideoClipMetadata;
}

function createOptions(overrides: Record<string, unknown> = {}) {
  return {
    avatarDescription: " Confident founder ",
    avatarName: " Founder ",
    context: "",
    count: 3,
    identityMode: "preserve",
    lighting: "studio",
    location: "Office",
    style: "ugc",
    ...overrides,
  } as unknown as CreateAvatarFromUgcClipOptions;
}

describe("useCreateAvatarFromUgcClip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.generateAvatarPhotos.mockResolvedValue({
      generatedPhotos: [
        {
          blob: new Blob(["generated"], { type: "image/jpeg" }),
          variant: { style: "ugc" },
        },
      ],
    });
  });

  it("validates clip type, avatar name, and avatar description", async () => {
    const state = useCreateAvatarFromUgcClip({
      createAvatar: vi.fn(),
      loadClip: vi.fn(),
      saveGeneratedPhotos: vi.fn(),
    });

    await expect(
      state.generate(createClip({ clipType: "demo" }), createOptions()),
    ).resolves.toBeNull();
    await expect(
      state.generate(createClip(), createOptions({ avatarName: " " })),
    ).resolves.toBeNull();
    await expect(
      state.generate(
        createClip(),
        createOptions({ avatarDescription: " " }),
      ),
    ).resolves.toBeNull();

    expect(mocks.stateSetter).toHaveBeenCalledWith(
      "Choose a UGC clip before creating an avatar.",
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith("Avatar name is required.");
    expect(mocks.stateSetter).toHaveBeenCalledWith(
      "Add a person description before creating an avatar.",
    );
    expect(mocks.generateAvatarPhotos).not.toHaveBeenCalled();
  });

  it("creates an avatar from a poster and saves generated photos", async () => {
    const avatar = {
      cliprVoiceId: "Zephyr (Female)",
      createdAt: "2026-05-20T00:00:00.000Z",
      description: "Confident founder",
      id: "avatar_1",
      name: "Founder",
      updatedAt: "2026-05-20T00:00:00.000Z",
      wardrobeStyle: "any" as const,
    };
    const createAvatar = vi.fn(async () => avatar);
    const saveGeneratedPhotos = vi.fn(async () => undefined);
    const state = useCreateAvatarFromUgcClip({
      createAvatar,
      loadClip: vi.fn(),
      saveGeneratedPhotos,
    });

    await expect(
      state.generate(createClip(), createOptions()),
    ).resolves.toBe(avatar);

    expect(mocks.generateAvatarPhotos).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarDescription: "Confident founder",
        avatar: expect.objectContaining({
          mimeType: "image/jpeg",
          name: "Founder testimonial",
        }),
      }),
    );
    expect(createAvatar).toHaveBeenCalledWith({
      description: "Confident founder",
      name: "Founder",
    });
    expect(saveGeneratedPhotos).toHaveBeenCalledWith(
      expect.any(Array),
      {
        avatarId: "avatar_1",
        sourceAvatarName: "Founder",
      },
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith(1);
    expect(mocks.stateSetter).toHaveBeenCalledWith(false);
  });

  it("loads a full clip poster and surfaces generation failures", async () => {
    const state = useCreateAvatarFromUgcClip({
      createAvatar: vi.fn(),
      loadClip: vi.fn(
        async () =>
          ({
            posterBlob: new Blob(["loaded"], { type: "image/png" }),
          }) as unknown as VideoClip,
      ),
      saveGeneratedPhotos: vi.fn(),
    });

    mocks.generateAvatarPhotos.mockRejectedValueOnce(new Error("provider down"));

    await expect(
      state.generate(createClip({ posterBlob: null }), createOptions()),
    ).resolves.toBeNull();

    expect(mocks.generateAvatarPhotos).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: expect.objectContaining({
          mimeType: "image/png",
        }),
      }),
    );
    expect(mocks.stateSetter).toHaveBeenCalledWith("provider down");
  });

  it("requires a poster before creating an avatar", async () => {
    const state = useCreateAvatarFromUgcClip({
      createAvatar: vi.fn(),
      loadClip: vi.fn(async () => null),
      saveGeneratedPhotos: vi.fn(),
    });

    await expect(
      state.generate(createClip({ posterBlob: null }), createOptions()),
    ).resolves.toBeNull();

    expect(mocks.stateSetter).toHaveBeenCalledWith(
      "This clip needs a poster before creating an avatar.",
    );
  });
});
