import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const privateRouteFiles = [
  "capabilities/route.ts",
  "outputs/[outputId]/download-url/route.ts",
  "outputs/[outputId]/materialize/route.ts",
  "outputs/[outputId]/route.ts",
  "product-style/route.ts",
  "render-revisions/[revisionId]/cancel/route.ts",
  "render-revisions/[revisionId]/resume/route.ts",
  "render-revisions/[revisionId]/route.ts",
  "render-revisions/route.ts",
  "tasks/[taskId]/cancel/route.ts",
  "tasks/[taskId]/resume/route.ts",
  "tasks/[taskId]/route.ts",
  "tasks/route.ts",
  "worker/checkpoints/get/route.ts",
  "worker/checkpoints/save/route.ts",
  "worker/claim/route.ts",
  "worker/complete/route.ts",
  "worker/cost-reservations/route.ts",
  "worker/fail/route.ts",
  "worker/lease-state/route.ts",
  "worker/progress/route.ts",
] as const;

describe("Studio Clips private response contract", () => {
  it("funnels every authenticated route success through the no-store helper", async () => {
    for (const routeFile of privateRouteFiles) {
      const source = await readFile(
        `app/api/studio/clips/${routeFile}`,
        "utf8",
      );
      expect(source, routeFile).toContain(
        "createStudioClipsPrivateJsonResponse",
      );
      expect(source, routeFile).not.toContain("Response.json(");
    }
  });
});
