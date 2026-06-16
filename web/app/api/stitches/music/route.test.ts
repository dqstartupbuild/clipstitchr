import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/stitches/music/route";

describe("POST /api/stitches/music", () => {
  it("returns gone because Stitch music generation was removed", async () => {
    const response = await POST(
      new Request("http://localhost/api/stitches/music"),
    );

    await expect(response.json()).resolves.toEqual({
      message:
        "Stitch music generation has been removed. Upload a music file instead.",
    });
    expect(response.status).toBe(410);
  });
});
