import { join } from "node:path";

export function createStudioClipsChildEnvironment(input: {
  cwd: string;
  path?: string;
}): NodeJS.ProcessEnv {
  const home = join(input.cwd, ".runtime-home");
  return {
    HOME: home,
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    NODE_ENV: "production",
    PATH: input.path ?? "/usr/local/bin:/usr/bin:/bin",
    TMPDIR: input.cwd,
    XDG_CACHE_HOME: join(home, ".cache"),
    XDG_CONFIG_HOME: join(home, ".config"),
  };
}
