import { describe, expect, it } from "vitest";
import { readSwaprJobCreateRequest } from "@/lib/clipstitchr/server/readSwaprJobCreateRequest";

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/swapr/jobs", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createBody(overrides: object = {}) {
  return {
    batchId: "batch_1",
    characterOrientation: "video",
    estimatedDurationSeconds: 4.5,
    generationSpeedTier: "pro",
    keepOriginalSound: true,
    mode: "pro",
    photoId: " photo_1 ",
    prompt: " product demo ",
    segmentIndex: 1.8,
    totalEstimatedDurationSeconds: 12,
    totalSegmentCount: 3,
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_1/swapr/reference.mp4",
      size: 10.2,
    },
    ...overrides,
  };
}

describe("readSwaprJobCreateRequest", () => {
  it("normalizes a valid Swapr job request", async () => {
    await expect(readSwaprJobCreateRequest(createRequest(createBody()))).resolves
      .toEqual({
        batchId: "batch_1",
        characterOrientation: "video",
        estimatedDurationSeconds: 4.5,
        generationSpeedTier: "pro",
        keepOriginalSound: true,
        mode: "pro",
        photoId: "photo_1",
        prompt: "product demo",
        segmentIndex: 1,
        totalEstimatedDurationSeconds: 12,
        totalSegmentCount: 3,
        videoObject: {
          contentType: "video/mp4",
          key: "users/user_1/swapr/reference.mp4",
          size: 11,
        },
      });
  });

  it("uses safe defaults for optional generation fields", async () => {
    const request = createRequest(
      createBody({
        batchId: "",
        characterOrientation: "unexpected",
        generationSpeedTier: "unexpected",
        keepOriginalSound: false,
        mode: "unexpected",
        prompt: "",
        segmentIndex: undefined,
        totalEstimatedDurationSeconds: undefined,
        totalSegmentCount: undefined,
      }),
    );

    await expect(readSwaprJobCreateRequest(request)).resolves.toMatchObject({
      batchId: "single",
      characterOrientation: "video",
      estimatedDurationSeconds: 4.5,
      generationSpeedTier: "studio",
      keepOriginalSound: false,
      mode: "pro",
      prompt: "",
      segmentIndex: 0,
      totalEstimatedDurationSeconds: 4.5,
      totalSegmentCount: 1,
    });
  });

  it("rejects missing required high-cost inputs before provider work", async () => {
    await expect(
      readSwaprJobCreateRequest(createRequest(createBody({ photoId: " " }))),
    ).rejects.toThrow("Choose a saved Swapr photo first.");

    await expect(
      readSwaprJobCreateRequest(
        createRequest(createBody({ estimatedDurationSeconds: 0 })),
      ),
    ).rejects.toThrow("Missing Swapr reference video duration.");

    await expect(
      readSwaprJobCreateRequest(
        createRequest(createBody({ totalEstimatedDurationSeconds: 0 })),
      ),
    ).rejects.toThrow("Missing Swapr total reference video duration.");
  });

  it("rejects invalid segment ranges and R2 references", async () => {
    await expect(
      readSwaprJobCreateRequest(
        createRequest(createBody({ segmentIndex: 3, totalSegmentCount: 3 })),
      ),
    ).rejects.toThrow("Invalid Swapr segment index.");

    await expect(
      readSwaprJobCreateRequest(
        createRequest(createBody({ totalSegmentCount: 0 })),
      ),
    ).rejects.toThrow("Missing Swapr segment count.");

    await expect(
      readSwaprJobCreateRequest(
        createRequest(createBody({ videoObject: { contentType: "video/mp4" } })),
      ),
    ).rejects.toThrow("Missing Swapr reference video object key.");

    await expect(
      readSwaprJobCreateRequest(
        createRequest(
          createBody({
            videoObject: {
              contentType: "video/mp4",
              key: "users/user_1/swapr/reference.mp4",
              size: 0,
            },
          }),
        ),
      ),
    ).rejects.toThrow("Missing Swapr reference video size.");
  });
});
