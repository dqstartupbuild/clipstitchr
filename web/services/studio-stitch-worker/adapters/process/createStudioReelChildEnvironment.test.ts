import { describe, expect, it } from "vitest";
import { createStudioReelChildEnvironment } from "./createStudioReelChildEnvironment";

describe("createStudioReelChildEnvironment", () => {
  it("uses workspace-local paths without forwarding process secrets", () => {
    process.env.STUDIO_STITCH_WORKER_SECRET = "must-not-leak";
    process.env.GEMINI_API_KEY = "must-not-leak-either";
    const environment = createStudioReelChildEnvironment({
      cwd: "/tmp/studio-stitch-test",
      path: "/usr/local/bin:/usr/bin:/bin",
    });

    expect(environment).toEqual({
      HOME: "/tmp/studio-stitch-test/.runtime-home",
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      NODE_ENV: "production",
      PATH: "/usr/local/bin:/usr/bin:/bin",
      TMPDIR: "/tmp/studio-stitch-test",
      XDG_CACHE_HOME: "/tmp/studio-stitch-test/.runtime-home/.cache",
      XDG_CONFIG_HOME: "/tmp/studio-stitch-test/.runtime-home/.config",
    });
    expect(Object.values(environment)).not.toContain("must-not-leak");
    expect(Object.values(environment)).not.toContain("must-not-leak-either");
  });
});
