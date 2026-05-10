import { describe, expect, it } from "vitest";
import { createZipBlob } from "@/lib/clipstitchr/utils/createZipBlob";

describe("createZipBlob", () => {
  it("creates a stored ZIP with local and central directory records", async () => {
    const blob = await createZipBlob([
      {
        name: "hello.txt",
        blob: new Blob(["hello"]),
        lastModified: new Date("2026-05-10T12:00:00Z"),
      },
    ]);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const text = new TextDecoder().decode(bytes);

    expect(blob.type).toBe("application/zip");
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(text).toContain("hello.txt");
    expect(text).toContain("hello");
    expect(view.getUint32(bytes.byteLength - 22, true)).toBe(0x06054b50);
  });
});
