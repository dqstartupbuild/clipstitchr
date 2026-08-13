import { describe, expect, it } from "vitest";
import { createStudioClipsChildEnvironment } from "./createStudioClipsChildEnvironment";

describe("createStudioClipsChildEnvironment", () => {
  it("uses workspace-local paths without forwarding process secrets", () => {
    process.env.R2_SECRET_ACCESS_KEY = "must-not-leak";
    process.env.ASSEMBLYAI_API_KEY = "must-not-leak-either";
    const environment = createStudioClipsChildEnvironment({
      cwd: "/tmp/studio-clips-test",
      path: "/usr/local/bin:/usr/bin:/bin",
    });

    expect(environment).toEqual({
      HOME: "/tmp/studio-clips-test/.runtime-home",
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      NODE_ENV: "production",
      PATH: "/usr/local/bin:/usr/bin:/bin",
      TMPDIR: "/tmp/studio-clips-test",
      XDG_CACHE_HOME: "/tmp/studio-clips-test/.runtime-home/.cache",
      XDG_CONFIG_HOME: "/tmp/studio-clips-test/.runtime-home/.config",
    });
    expect(Object.values(environment)).not.toContain("must-not-leak");
    expect(Object.values(environment)).not.toContain("must-not-leak-either");
  });
});
