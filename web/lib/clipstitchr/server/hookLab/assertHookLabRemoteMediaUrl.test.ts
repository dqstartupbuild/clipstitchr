import { describe, expect, it, vi } from "vitest";
import { assertHookLabRemoteMediaUrl } from "@/lib/clipstitchr/server/hookLab/assertHookLabRemoteMediaUrl";

describe("assertHookLabRemoteMediaUrl", () => {
  it("accepts HTTPS hosts only when every DNS answer is public", async () => {
    const resolveHostname = vi.fn(async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "2606:4700:4700::1111", family: 6 },
    ]);

    await expect(
      assertHookLabRemoteMediaUrl("https://cdn.example.com/video.mp4", resolveHostname),
    ).resolves.toEqual(new URL("https://cdn.example.com/video.mp4"));
    expect(resolveHostname).toHaveBeenCalledWith("cdn.example.com");
  });

  it("rejects credentials, non-HTTPS URLs, metadata hosts, and private DNS", async () => {
    const privateDns = vi.fn(async () => [{ address: "10.0.0.2", family: 4 }]);

    await expect(
      assertHookLabRemoteMediaUrl("http://cdn.example.com/video.mp4", privateDns),
    ).rejects.toThrow("secure public URL");
    await expect(
      assertHookLabRemoteMediaUrl("https://user:pass@cdn.example.com/video.mp4", privateDns),
    ).rejects.toThrow("secure public URL");
    await expect(
      assertHookLabRemoteMediaUrl("https://metadata.google.internal/video", privateDns),
    ).rejects.toThrow("public host");
    await expect(
      assertHookLabRemoteMediaUrl("https://cdn.example.com/video.mp4", privateDns),
    ).rejects.toThrow("resolve to a public host");
    await expect(
      assertHookLabRemoteMediaUrl(
        "https://mixed.example.com/video.mp4",
        async () => [
          { address: "93.184.216.34", family: 4 },
          { address: "192.168.1.10", family: 4 },
        ],
      ),
    ).rejects.toThrow("resolve to a public host");
    await expect(
      assertHookLabRemoteMediaUrl("https://169.254.169.254/latest/meta-data", privateDns),
    ).rejects.toThrow("resolve to a public host");
  });
});
