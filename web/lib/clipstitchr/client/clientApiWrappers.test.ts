import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCliprJob } from "@/lib/clipstitchr/client/createCliprJob";
import { createProductProfile } from "@/lib/clipstitchr/client/createProductProfile";
import { createSwaprPrediction } from "@/lib/clipstitchr/client/createSwaprPrediction";
import { generateCliprText } from "@/lib/clipstitchr/client/generateCliprText";
import { generateStitchrBatch } from "@/lib/clipstitchr/client/generateStitchrBatch";
import { generateSwiprBackgroundWithAi } from "@/lib/clipstitchr/client/generateSwiprBackgroundWithAi";
import { generateSwiprDrafts } from "@/lib/clipstitchr/client/generateSwiprDrafts";
import { importPexelsPhotosToSwiprLibrary } from "@/lib/clipstitchr/client/importPexelsPhotosToSwiprLibrary";
import { searchPexelsPhotos } from "@/lib/clipstitchr/client/searchPexelsPhotos";
import { scoreVideoClip } from "@/lib/clipstitchr/client/scoreVideoClip";
import { updateProductProfile } from "@/lib/clipstitchr/client/updateProductProfile";
import { createR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createR2DownloadUrl";
import { createR2DownloadUrls } from "@/lib/clipstitchr/client/r2/createR2DownloadUrls";
import { createR2UploadUrl } from "@/lib/clipstitchr/client/r2/createR2UploadUrl";
import { createSwiprBackgroundUploadUrl } from "@/lib/clipstitchr/client/r2/createSwiprBackgroundUploadUrl";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import { downloadMusicTrackBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadMusicTrackBlobFromR2";
import { downloadSwiprBackgroundBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadSwiprBackgroundBlobFromR2";
import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";

const fetchMock = vi.fn();

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function createBlobResponse(blob: Blob, status = 200) {
  return new Response(blob, { status });
}

function createR2Object(contentType = "video/mp4") {
  return {
    contentType,
    key: "users/user_123/media/file.mp4",
    size: 123,
  };
}

function createProduct() {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "Landing page builder",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("client API wrappers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts JSON to generation and product endpoints", async () => {
    const product = createProduct();

    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ job: { id: "job_1" } }))
      .mockResolvedValueOnce(
        createJsonResponse({
          hook: "Hook",
          overlayText: "Overlay",
          script: "Script",
          slides: ["Slide"],
        }),
      )
      .mockResolvedValueOnce(createJsonResponse({ product }))
      .mockResolvedValueOnce(
        createJsonResponse({ product: { ...product, name: "Updated" } }),
      )
      .mockResolvedValueOnce(createJsonResponse({ id: "swapr_job_1" }))
      .mockResolvedValueOnce(
        createJsonResponse({
          batchDate: "2026-06-17",
          count: 10,
          runId: "stitchr-batch:user_123:2026-06-17",
          status: "running",
          taskIds: ["task_1"],
        }),
      );

    await expect(
      createCliprJob({
        avatarId: "avatar_1",
        avatarSceneLocation: "gym mirror",
        avatarSceneOutfit: "black workout set",
        avatarScenePose: "taking a progress photo",
        durationSeconds: 30,
        generationMode: "script",
        jobId: "job_1",
        musicTrackId: "track_1",
        productId: "product_1",
        scriptIdea: "Founder confession angle",
        voiceId: "Rachel",
      }),
    ).resolves.toEqual({ id: "job_1" });
    await expect(
      generateCliprText({
        durationSeconds: 30,
        productId: "product_1",
        purpose: "clipr",
      }),
    ).resolves.toEqual({
      hook: "Hook",
      overlayText: "Overlay",
      script: "Script",
      slides: ["Slide"],
    });
    await expect(
      createProductProfile({
        audienceDetails: "Creators",
        name: "Launch Kit",
        productDetails: "Landing page builder",
      }),
    ).resolves.toEqual(product);
    await expect(
      updateProductProfile("product/1", {
        audienceDetails: "Creators",
        name: "Updated",
        productDetails: "Landing page builder",
      }),
    ).resolves.toEqual({ ...product, name: "Updated" });
    await expect(
      createSwaprPrediction({
        batchId: "batch_1",
        characterOrientation: "image",
        keepOriginalSound: true,
        mode: "std",
        photoId: "photo_1",
        prompt: "Swap this person",
        segment: {
          duration: 12,
          videoObject: createR2Object(),
        },
        segmentIndex: 0,
        totalEstimatedDurationSeconds: 12,
        totalSegmentCount: 1,
      } as Parameters<typeof createSwaprPrediction>[0]),
    ).resolves.toEqual({ id: "swapr_job_1" });
    await expect(generateStitchrBatch()).resolves.toEqual(
      expect.objectContaining({
        count: 10,
        status: "running",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/clipr/jobs",
      expect.objectContaining({
        body: expect.stringContaining(
          '"avatarSceneOutfit":"black workout set"',
        ),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/settings/products/product%2F1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/stitchr/batch/generate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("scores saved video clips", async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        performanceScore: {
          bestUse: "Use as the opener",
          fixes: ["Trim the pause"],
          overall: 88,
          strengths: ["Clear hook"],
          summary: "Strong opener.",
        },
      }),
    );

    await expect(scoreVideoClip("clip_1")).resolves.toEqual(
      expect.objectContaining({
        overall: 88,
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/video-clips/score",
      expect.objectContaining({
        body: JSON.stringify({ clipId: "clip_1" }),
        method: "POST",
      }),
    );
  });

  it("sends selected Stitchr batch templates", async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        batchDate: "2026-06-17",
        count: 10,
        runId: "stitchr-batch:user_123:2026-06-17",
        status: "running",
        taskIds: [],
      }),
    );

    await generateStitchrBatch({
      templateId: "template_1",
      timeZone: "America/Detroit",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/stitchr/batch/generate",
      expect.objectContaining({
        body: JSON.stringify({
          templateId: "template_1",
          timeZone: "America/Detroit",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );
  });

  it("surfaces generation and product error messages", async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ message: "No Clipr" }, 400))
      .mockResolvedValueOnce(new Response("not-json", { status: 500 }))
      .mockResolvedValueOnce(createJsonResponse({ message: "No product" }, 400))
      .mockResolvedValueOnce(createJsonResponse({}, 200));

    await expect(
      createCliprJob({
        avatarId: "avatar_1",
        durationSeconds: 30,
        generationMode: "script",
        jobId: "job_1",
        productId: "product_1",
        videoModelId: "prunaai/p-video-avatar",
        voiceId: "Rachel",
      }),
    ).rejects.toThrow("No Clipr");
    await expect(
      generateCliprText({ productId: "product_1", purpose: "clipr" }),
    ).rejects.toThrow("Unable to generate Clipr text.");
    await expect(
      createProductProfile({
        audienceDetails: "",
        name: "",
        productDetails: "",
      }),
    ).rejects.toThrow("No product");
    await expect(
      updateProductProfile("product_1", {
        audienceDetails: "",
        name: "",
        productDetails: "",
      }),
    ).rejects.toThrow("Unable to update this product.");
  });

  it("handles Swipr background generation responses", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(new Blob(["image"], { type: "image/png" }), {
          status: 200,
          headers: {
            "x-clipstitchr-swipr-background-generation":
              encodeURIComponent("Generated detail"),
          },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ message: "No background" }, 500),
      );

    await expect(
      generateSwiprBackgroundWithAi({
        prompt: "sunlit counter",
        presetId: "studio",
        productContext: "Launch Kit",
      }),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      generationDetails: "Generated detail",
    });
    await expect(
      generateSwiprBackgroundWithAi({ productContext: "Launch Kit" }),
    ).rejects.toThrow("No background");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/swipr/backgrounds/generate",
      expect.objectContaining({
        body: JSON.stringify({
          productContext: "Launch Kit",
          prompt: "sunlit counter",
          presetId: "studio",
        }),
      }),
    );
  });

  it("wraps Swipr Pexels import and draft generation endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          ids: ["background_1"],
          imported: 1,
          page: 3,
          query: "desk setup",
          searched: 1,
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          count: 2,
          ids: ["swipe_1", "swipe_2"],
          providerModel: "text-model",
          providerPredictionId: "prediction_1",
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ message: "Import failed" }, 400),
      )
      .mockResolvedValueOnce(createJsonResponse({}, 500));

    await expect(
      importPexelsPhotosToSwiprLibrary({
        count: 12,
        page: 3,
        query: "desk setup",
      }),
    ).resolves.toEqual({
      ids: ["background_1"],
      imported: 1,
      page: 3,
      query: "desk setup",
      searched: 1,
    });
    await expect(
      generateSwiprDrafts({
        callToActionStyle: "follow",
        count: 2,
        creativeContext: "Focus on launch-day anxiety.",
        productId: "product_1",
        selectedLibraryQueries: ["desk setup"],
        slideCount: 8,
      }),
    ).resolves.toEqual({
      count: 2,
      ids: ["swipe_1", "swipe_2"],
      providerModel: "text-model",
      providerPredictionId: "prediction_1",
    });
    await expect(
      importPexelsPhotosToSwiprLibrary({ count: 1, query: "bad" }),
    ).rejects.toThrow("Import failed");
    await expect(
      generateSwiprDrafts({
        callToActionStyle: "any",
        count: 1,
        creativeContext: "",
        productId: "product_1",
        selectedLibraryQueries: [],
        slideCount: 8,
      }),
    ).rejects.toThrow("Unable to generate draft Swipes.");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/swipr/pexels/import",
      expect.objectContaining({
        body: JSON.stringify({ count: 12, page: 3, query: "desk setup" }),
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/swipr/drafts/generate",
      expect.objectContaining({
        body: JSON.stringify({
          callToActionStyle: "follow",
          count: 2,
          creativeContext: "Focus on launch-day anxiety.",
          productId: "product_1",
          selectedLibraryQueries: ["desk setup"],
          slideCount: 8,
        }),
        method: "POST",
      }),
    );
  });

  it("wraps paged Swipr Pexels search results", async () => {
    const photo = {
      alt: "Desk setup",
      height: 1920,
      id: 123,
      photographer: "Avery",
      photographerUrl: "https://pexels.com/@avery",
      pexelsUrl: "https://pexels.com/photo/123",
      src: {
        large: "https://images.pexels.com/large.jpg",
        large2x: "https://images.pexels.com/large2x.jpg",
        medium: "https://images.pexels.com/medium.jpg",
        original: "https://images.pexels.com/original.jpg",
        portrait: "https://images.pexels.com/portrait.jpg",
        small: "https://images.pexels.com/small.jpg",
      },
      width: 1080,
    };

    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({ hasMore: true, page: 2, photos: [photo] }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ message: "Search failed" }, 400),
      );

    await expect(
      searchPexelsPhotos({
        page: 2,
        perPage: 12,
        query: "desk setup",
      }),
    ).resolves.toEqual({ hasMore: true, page: 2, photos: [photo] });
    await expect(searchPexelsPhotos({ page: 1, query: "bad" })).rejects.toThrow(
      "Search failed",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/swipr/pexels/search",
      expect.objectContaining({
        body: JSON.stringify({ page: 2, perPage: 12, query: "desk setup" }),
        method: "POST",
      }),
    );
  });

  it("wraps R2 signed URLs, uploads, downloads, and response errors", async () => {
    const sourceBlob = new Blob(["source"], { type: "" });
    const imageBlob = new Blob(["image"], { type: "image/png" });
    const r2Object = createR2Object();

    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({ key: "uploads/file.mp4", url: "https://upload" }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          expiresIn: 60,
          key: "uploads/bg.png",
          url: "https://bg-upload",
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ urls: [{ expiresIn: 60, key: "a", url: "u" }] }),
      )
      .mockResolvedValueOnce(createJsonResponse({ ok: true }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(
        createJsonResponse({ expiresIn: 60, url: "r2-url" }),
      )
      .mockResolvedValueOnce(createBlobResponse(new Blob(["video"])))
      .mockResolvedValueOnce(
        createJsonResponse({ expiresIn: 60, url: "music-url" }),
      )
      .mockResolvedValueOnce(
        createBlobResponse(new Blob(["audio"], { type: "audio/wav" })),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ expiresIn: 60, url: "background-url" }),
      )
      .mockResolvedValueOnce(
        createBlobResponse(new Blob(["background"], { type: "image/jpeg" })),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ expiresIn: 60, url: "direct" }),
      )
      .mockResolvedValueOnce(createJsonResponse({ expiresIn: 60, url: "bad" }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(
      createR2UploadUrl({
        blob: sourceBlob,
        kind: "video-clip-video",
        recordId: "clip_1",
      }),
    ).resolves.toEqual({
      contentType: "application/octet-stream",
      key: "uploads/file.mp4",
      size: sourceBlob.size,
      url: "https://upload",
    });
    await expect(
      createSwiprBackgroundUploadUrl({
        blob: imageBlob,
        recordId: "background_1",
      }),
    ).resolves.toEqual({
      contentType: "image/png",
      expiresIn: 60,
      key: "uploads/bg.png",
      size: imageBlob.size,
      url: "https://bg-upload",
    });
    await expect(createR2DownloadUrls([])).resolves.toEqual([]);
    await expect(createR2DownloadUrls(["a"])).resolves.toEqual([
      { expiresIn: 60, key: "a", url: "u" },
    ]);
    await expect(deleteObjectsFromR2([])).resolves.toBeUndefined();
    await expect(deleteObjectsFromR2([r2Object])).resolves.toBeUndefined();
    await expect(
      putBlobToR2({
        blob: imageBlob,
        contentType: "image/png",
        key: "uploads/bg.png",
        size: imageBlob.size,
        url: "https://put",
      }),
    ).resolves.toEqual({
      contentType: "image/png",
      key: "uploads/bg.png",
      size: imageBlob.size,
    });
    await expect(
      putBlobToR2({
        blob: imageBlob,
        contentType: "image/png",
        key: "uploads/bg.png",
        size: imageBlob.size,
        url: "https://put",
      }),
    ).rejects.toThrow("Unable to upload media to R2.");
    await expect(downloadBlobFromR2(r2Object)).resolves.toEqual(
      expect.objectContaining({ type: "video/mp4" }),
    );
    await expect(downloadMusicTrackBlobFromR2("track_1")).resolves.toEqual(
      expect.objectContaining({ type: "audio/wav" }),
    );
    await expect(
      downloadSwiprBackgroundBlobFromR2("background_1"),
    ).resolves.toEqual(expect.objectContaining({ type: "image/jpeg" }));
    await expect(createR2DownloadUrl(r2Object)).resolves.toEqual({
      expiresIn: 60,
      url: "direct",
    });
    await expect(
      downloadBlobFromR2({
        ...r2Object,
        key: "users/user_123/clips/failing-video.mp4",
      }),
    ).rejects.toThrow("Unable to download media from R2.");

    await expect(
      readR2JsonResponse(createJsonResponse({ ok: true })),
    ).resolves.toEqual({ ok: true });
    await expect(
      readR2JsonResponse(createJsonResponse({ error: "Denied" }, 403)),
    ).rejects.toThrow("Denied");
    await expect(
      readR2JsonResponse(createJsonResponse({}, 500)),
    ).rejects.toThrow("R2 request failed.");
  });

  it("normalizes music downloads from shared tracks and direct objects", async () => {
    const audioObject = createR2Object("audio/mpeg");

    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({ expiresIn: 60, url: "music-url" }),
      )
      .mockResolvedValueOnce(
        createBlobResponse(new Blob(["audio"], { type: "audio/wav" })),
      )
      .mockResolvedValueOnce(
        createJsonResponse({ expiresIn: 60, url: "direct" }),
      )
      .mockResolvedValueOnce(
        createBlobResponse(new Blob(["audio"], { type: "audio/mpeg" })),
      );

    await expect(
      downloadMusicBlob({ audioObject, sharedTrackId: "track_1" }),
    ).resolves.toEqual(expect.objectContaining({ type: "audio/mpeg" }));
    await expect(downloadMusicBlob({ audioObject })).resolves.toEqual(
      expect.objectContaining({ type: "audio/mpeg" }),
    );
  });
});
