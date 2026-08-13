import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Studio Clips worker Dockerfile", () => {
  it("installs production tsx and ships media tools, fonts, tini, and offline health", async () => {
    const [dockerfile, manifest] = await Promise.all([
      readFile("services/studio-clips-worker/Dockerfile", "utf8"),
      readFile("package.json", "utf8").then((value) => JSON.parse(value)),
    ]);
    expect(manifest.dependencies?.tsx).toMatch(/^\^4\./);
    expect(dockerfile).toContain("FROM node:22-bookworm-slim");
    expect(dockerfile).toContain("npm install --global npm@11.5.1 --ignore-scripts");
    expect(dockerfile).toContain("ffmpeg python3 tini");
    expect(dockerfile).not.toMatch(/apt-get install[^\n]*yt-dlp/);
    expect(dockerfile).toContain(
      "https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.09/yt-dlp",
    );
    expect(dockerfile).toContain(
      "sha256:e5d57466682cfa9d61e9cf7c8a4f09b00f4a62af37d3bbdc4bcffdf63615feac",
    );
    expect(dockerfile).toContain("chmod 0755 /usr/local/bin/yt-dlp");
    expect(dockerfile).toContain("npm ci --ignore-scripts --omit=dev --workspaces=false");
    expect(dockerfile).toContain(
      "COPY vendor/supoclip/v0_1_0/upstream/backend/fonts ./services/studio-clips-worker/assets/fonts",
    );
    expect(dockerfile).toContain("STUDIO_CLIPS_BUILT_IN_FONTS_DIRECTORY=");
    expect(dockerfile).toContain('ENTRYPOINT ["/usr/bin/tini"');
    expect(dockerfile).toContain('CMD ["--once"]');
    expect(dockerfile).toContain('runStudioClipsWorker.ts", "--check"]');
  });
});
