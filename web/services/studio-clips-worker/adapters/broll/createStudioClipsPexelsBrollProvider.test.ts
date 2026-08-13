import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsPexelsBrollProvider } from "./createStudioClipsPexelsBrollProvider";

describe("createStudioClipsPexelsBrollProvider", () => {
  it("downloads a bounded portrait video only from Pexels' fixed media host", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-pexels-test-"));
    const request = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      if (href.startsWith("https://api.pexels.com/videos/search")) {
        expect(new Headers(init?.headers).get("authorization")).toBe("pexels-secret");
        return Response.json({
          videos: [
            {
              video_files: [
                {
                  file_type: "video/mp4",
                  height: 1920,
                  link: "https://videos.pexels.com/video.mp4",
                  width: 1080,
                },
              ],
            },
          ],
        });
      }
      return new Response("video-bytes", {
        headers: { "content-type": "video/mp4" },
      });
    });
    const provider = createStudioClipsPexelsBrollProvider({
      config: { apiKey: "pexels-secret" },
      fetch: request as typeof fetch,
    });

    try {
      const artifacts = await provider(
        {
          analysis: {
            payload: {
              brollOpportunities: [
                {
                  candidateId: "candidate-1",
                  durationSeconds: 3,
                  searchTerm: "coffee beans",
                  startSeconds: 2,
                },
              ],
            },
            snapshotVersion: 1,
          },
        },
        root,
      );
      expect(artifacts).toHaveLength(1);
      expect(await readFile(artifacts[0].localPath, "utf8")).toBe("video-bytes");
      expect(request).toHaveBeenNthCalledWith(
        2,
        new URL("https://videos.pexels.com/video.mp4"),
        expect.objectContaining({ redirect: "manual" }),
      );
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
