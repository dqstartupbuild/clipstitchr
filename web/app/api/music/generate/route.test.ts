import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/music/generate/route";

describe("POST /api/music/generate", () => {
  it("returns gone because music generation was removed", async () => {
    const response = await POST(new Request("http://localhost/api/music/generate"));

    await expect(response.json()).resolves.toEqual({
      message: "Music generation has been removed. Upload a music file instead.",
    });
    expect(response.status).toBe(410);
  });
});
