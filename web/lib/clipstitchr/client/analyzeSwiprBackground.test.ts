import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeSwiprBackground } from "@/lib/clipstitchr/client/analyzeSwiprBackground";

describe("analyzeSwiprBackground", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a background file and normalizes the response metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: vi.fn(async () => ({
          description: "  Studio backdrop  ",
          details: "  Wide shot  ",
          name: "  Studio  ",
          tags: ["hero", "hero", ""],
        })),
        ok: true,
      })),
    );

    await expect(
      analyzeSwiprBackground({
        blob: new Blob(["image"], { type: "image/png" }),
        originalName: "hero.png",
      }),
    ).resolves.toEqual({
      description: "Studio backdrop",
      details: "Wide shot",
      name: "Studio",
      tags: ["hero"],
    });

    const formData = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
      .body as FormData;

    expect(fetch).toHaveBeenCalledWith("/api/swipr/backgrounds/analyze", {
      body: expect.any(FormData),
      method: "POST",
    });
    expect(formData.get("originalName")).toBe("hero.png");
    expect(formData.get("file")).toEqual(expect.any(Blob));
  });

  it("uses fallback fields and throws server messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: vi.fn(async () => ({
          tags: "not-tags",
        })),
        ok: true,
      })),
    );

    await expect(
      analyzeSwiprBackground({
        blob: new Blob(["image"], { type: "image/jpeg" }),
        originalName: "hero-shot.jpg",
      }),
    ).resolves.toEqual({
      description: undefined,
      details: undefined,
      name: "hero-shot",
      tags: [],
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: vi.fn(async () => ({
          message: "Analysis unavailable.",
        })),
        ok: false,
      })),
    );

    await expect(
      analyzeSwiprBackground({
        blob: new Blob(["image"]),
        originalName: "hero.jpg",
      }),
    ).rejects.toThrow("Analysis unavailable.");
  });
});
