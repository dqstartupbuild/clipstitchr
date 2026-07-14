import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

describe("public tool route rollout coverage", () => {
  it.each(publicToolKeys)("resolves the server variant for %s", (toolKey) => {
    const routeSource = readFileSync(
      join(process.cwd(), "app", "(content)", "tools", toolKey, "page.tsx"),
      "utf8",
    );

    expect(routeSource).toContain("resolvePublicToolGateVariantForRequest");
  });
});
