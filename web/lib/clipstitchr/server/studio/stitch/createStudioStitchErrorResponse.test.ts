import { describe, expect, it } from "vitest";
import { createStudioStitchErrorResponse } from "./createStudioStitchErrorResponse";

describe("createStudioStitchErrorResponse", () => {
  it("preserves safe status categories without exposing internal details", async () => {
    const cases = [
      { error: new Error("Output not found at users/u1/private.mp4"), status: 404 },
      { error: new Error("revision conflict https://secret.example/a"), status: 409 },
      { error: new Error("invalid key users/u1/private.mp4"), status: 400 },
      { error: new Error("Bearer private-token https://provider.example"), status: 500 },
    ];
    for (const item of cases) {
      const response = createStudioStitchErrorResponse(item.error);
      expect(response.status).toBe(item.status);
      const body = JSON.stringify(await response.json());
      expect(body).not.toContain("users/u1");
      expect(body).not.toContain("private-token");
      expect(body).not.toContain("https://");
    }
  });
});
