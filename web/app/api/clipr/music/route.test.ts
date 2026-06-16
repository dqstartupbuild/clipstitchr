import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/clipr/music/route";

describe("POST /api/clipr/music", () => {
  it("returns gone because Clip music generation was removed", async () => {
    const response = await POST(new Request("http://localhost/api/clipr/music"));

    await expect(response.json()).resolves.toEqual({
      message:
        "Clip music generation has been removed. Upload a music file instead.",
    });
    expect(response.status).toBe(410);
  });
});
