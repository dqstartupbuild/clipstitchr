import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Studio Stitch worker Dockerfile", () => {
  it("keeps the linux worker image minimal, non-root, and credential-free", async () => {
    const dockerfile = await readFile(
      new URL("./Dockerfile", import.meta.url),
      "utf8",
    );
    expect(dockerfile).toContain("FROM node:22-bookworm-slim");
    expect(dockerfile).toContain("ca-certificates ffmpeg tini");
    expect(dockerfile).toContain("npm ci --ignore-scripts --omit=dev");
    expect(dockerfile).toContain("ENV NODE_ENV=production");
    expect(dockerfile).toContain("-name '*.test.ts'");
    expect(dockerfile).toContain("USER node");
    expect(dockerfile).toContain("STOPSIGNAL SIGTERM");
    expect(dockerfile).toContain('CMD ["--once"]');
    expect(dockerfile).toContain('CMD ["./node_modules/.bin/tsx"');
    expect(dockerfile).not.toMatch(/COPY\s+\.env/iu);
    expect(dockerfile).not.toMatch(/(?:SECRET|TOKEN|API_KEY)=/u);
  });
});
