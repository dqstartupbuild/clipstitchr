import { describe, expect, it } from "vitest";
import { createStudioReelWorkerErrorResponse } from "./createStudioReelWorkerErrorResponse";

describe("createStudioReelWorkerErrorResponse", () => {
  it("maps worker states without echoing secrets, URLs, or object keys", async () => {
    const cases = [
      { error: new Error("Unauthorized Studio Stitch worker secret=bad"), status: 401 },
      { error: new Error("run not found users/u1/private.mp4"), status: 404 },
      { error: new Error("lease conflict at https://private.example"), status: 409 },
      { error: new Error("invalid api_key=abc"), status: 400 },
      { error: new Error("provider said Bearer private-token"), status: 500 },
    ];
    for (const item of cases) {
      const response = createStudioReelWorkerErrorResponse(item.error);
      expect(response.status).toBe(item.status);
      const body = JSON.stringify(await response.json());
      expect(body).not.toContain("users/u1");
      expect(body).not.toContain("private-token");
      expect(body).not.toContain("https://");
      expect(body).not.toContain("api_key");
      expect(body).not.toContain("secret=bad");
    }
  });
});
