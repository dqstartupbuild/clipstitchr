import { describe, expect, it, vi } from "vitest";
import type { StudioClipsWorkerDependencies } from "../contracts/StudioClipsWorkerDependencies";
import type { StudioClipsR2ObjectStore } from "../adapters/r2/StudioClipsR2ObjectStore";
import { createStudioClipsTestClaim } from "../testing/createStudioClipsTestClaim";
import { createStudioClipsTestDependencies } from "../testing/createStudioClipsTestDependencies";
import { createStudioClipsCompletionEvidence } from "./createStudioClipsCompletionEvidence";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import { runStudioClipsWorkerOnce } from "./runStudioClipsWorkerOnce";

const config: StudioClipsWorkerRuntimeConfig = {
  analysis: { apiKey: "analysis", model: "model", provider: "openai" },
  assemblyAi: { apiKey: "assembly", pollIntervalMs: 1, timeoutMs: 5_000 },
  commands: {
    builtInFontsDirectory: "/fonts",
    ffmpegPath: "ffmpeg",
    ffprobePath: "ffprobe",
    ytDlpPath: "yt-dlp",
  },
  coordinator: {
    origin: "https://clipstitchr.test",
    requestTimeoutMs: 1_000,
    secret: "secret",
  },
  leaseSeconds: 300,
  pollIntervalMs: 1_000,
  r2: {
    accessKeyId: "access",
    accountId: "a".repeat(32),
    bucketName: "clips",
    secretAccessKey: "secret",
  },
  workerId: "worker-1",
};

const objects = {} as StudioClipsR2ObjectStore;

describe("runStudioClipsWorkerOnce", () => {
  it("claims, processes, and completes with trusted rendered-media metadata", async () => {
    const claim = createStudioClipsTestClaim();
    const posts: Array<{ body: unknown; path: string }> = [];
    const http = {
      post: vi.fn(async (path: string, body: unknown) => {
        posts.push({ body, path });
        return path.endsWith("/claim")
          ? { availability: { state: "available" }, claim }
          : { accepted: true };
      }),
    };
    const { dependencies } = createStudioClipsTestDependencies();
    const evidence = createStudioClipsCompletionEvidence();
    const originalProbe = dependencies.pipeline.probeMedia;
    dependencies.pipeline.probeMedia = vi.fn(async (input) => {
      const media = await originalProbe(input);
      if (input.localPath.endsWith("clip.mp4")) {
        evidence.recordProbe(input.localPath, media);
      }
      return media;
    });
    const originalRender = dependencies.pipeline.render;
    dependencies.pipeline.render = vi.fn(async (input) => {
      const renders = await originalRender(input);
      for (const render of renders) {
        evidence.recordRenderPath({
          artifactId: render.artifactId,
          fileName: render.fileName,
          localPath: render.localPath,
        });
      }
      return renders;
    });
    evidence.recordAnalysis({ schemaVersion: "studio-clips-analysis-v1" });

    await expect(
      runStudioClipsWorkerOnce({
        config,
        http,
        objects,
        sessionFactory: () => ({ dependencies, evidence }),
      }),
    ).resolves.toEqual({
      availability: { state: "available" },
      state: "completed",
      taskId: "task_123",
    });
    const completion = posts.find((post) => post.path.endsWith("/complete"));
    expect(completion?.body).toMatchObject({
      attempt: 1,
      leaseId: "lease_123",
      outputs: [
        {
          audioCodec: "aac",
          durationSeconds: 30,
          fileName: "clip-1.mp4",
          hasAudio: true,
          height: 1920,
          videoCodec: "h264",
          width: 1080,
        },
      ],
      ownerId: "user_123",
      productId: "product_123",
      taskId: "task_123",
    });
  });

  it("reports a classified pipeline failure without sending completion", async () => {
    const claim = createStudioClipsTestClaim();
    const posts: Array<{ body: unknown; path: string }> = [];
    const http = {
      post: vi.fn(async (path: string, body: unknown) => {
        posts.push({ body, path });
        return path.endsWith("/claim")
          ? { availability: { state: "available" }, claim }
          : { accepted: true };
      }),
    };
    const { dependencies } = createStudioClipsTestDependencies();
    vi.mocked(dependencies.access.assertStudioAccess).mockRejectedValue(
      new Error("access denied"),
    );

    await expect(
      runStudioClipsWorkerOnce({
        config,
        http,
        objects,
        sessionFactory: () => ({
          dependencies: dependencies as StudioClipsWorkerDependencies,
          evidence: createStudioClipsCompletionEvidence(),
        }),
      }),
    ).resolves.toMatchObject({ state: "failed", taskId: "task_123" });
    expect(posts.some((post) => post.path.endsWith("/fail"))).toBe(true);
    expect(posts.some((post) => post.path.endsWith("/complete"))).toBe(false);
  });
});
