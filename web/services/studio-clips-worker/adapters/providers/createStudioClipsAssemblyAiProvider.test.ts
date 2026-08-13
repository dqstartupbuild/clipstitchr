import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { createStudioClipsAssemblyAiProvider } from "./createStudioClipsAssemblyAiProvider";

describe("createStudioClipsAssemblyAiProvider", () => {
  it("uploads, submits, polls, and returns grounded word timing without leaking its key", async () => {
    const root = await mkdtemp(join(tmpdir(), "studio-clips-aai-test-"));
    const audioPath = join(root, "speech.mp3");
    await writeFile(audioPath, "speech");
    const requests: string[] = [];
    const request = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      requests.push(href);
      expect(new Headers(init?.headers).get("authorization")).toBe("assembly-secret");
      if (href.endsWith("/upload")) {
        return Response.json({ upload_url: "https://cdn.assemblyai.com/upload/token" });
      }
      if (href.endsWith("/transcript")) {
        return Response.json({ id: "transcript_12345" });
      }
      return Response.json({
        language_code: "en_us",
        status: "completed",
        words: [
          { end: 500, start: 0, text: "A" },
          { end: 1_000, start: 500, text: "grounded" },
          { end: 1_500, start: 1_000, text: "clip." },
        ],
      });
    });
    const provider = createStudioClipsAssemblyAiProvider({
      config: { apiKey: "assembly-secret", pollIntervalMs: 1, timeoutMs: 5_000 },
      fetch: request as typeof fetch,
      sleep: vi.fn(async () => undefined),
    });

    try {
      await expect(provider.transcribe({ audioPath })).resolves.toEqual({
        languageCode: "en-us",
        text: "[00:00:00.000 - 00:00:01.500] A grounded clip.",
      });
      expect(requests).toEqual([
        "https://api.assemblyai.com/v2/upload",
        "https://api.assemblyai.com/v2/transcript",
        "https://api.assemblyai.com/v2/transcript/transcript_12345",
      ]);
      expect(JSON.stringify(request.mock.calls)).not.toContain("Bearer");
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("rejects provider upload URLs outside AssemblyAI's fixed CDN host", async () => {
    const provider = createStudioClipsAssemblyAiProvider({
      config: { apiKey: "secret", pollIntervalMs: 1, timeoutMs: 5_000 },
      fetch: vi.fn(async () =>
        Response.json({ upload_url: "https://attacker.example/audio" }),
      ) as typeof fetch,
    });
    await expect(provider.transcribe({ audioPath: "/dev/null" })).rejects.toMatchObject({
      code: "UNSAFE_TRANSCRIPTION_UPLOAD_URL",
    });
  });
});
