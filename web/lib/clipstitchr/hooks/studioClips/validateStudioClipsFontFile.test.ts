import { describe, expect, it } from "vitest";
import { validateStudioClipsFontFile } from "./validateStudioClipsFontFile";

describe("validateStudioClipsFontFile", () => {
  it.each([
    [new Uint8Array([0x00, 0x01, 0x00, 0x00]), "font/ttf"],
    [new TextEncoder().encode("OTTO"), "font/otf"],
  ])("normalizes a verified font signature", async (signature, type) => {
    const file = new File([signature, new Uint8Array(16)], "caption-font.bin");
    await expect(validateStudioClipsFontFile(file)).resolves.toMatchObject({
      size: 20,
      type,
    });
  });

  it("rejects an extension-only or oversized file", async () => {
    await expect(
      validateStudioClipsFontFile(
        new File([new TextEncoder().encode("not a font payload")], "fake.ttf"),
      ),
    ).rejects.toThrow("not a valid");

    const oversized = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "large.ttf",
    );
    await expect(validateStudioClipsFontFile(oversized)).rejects.toThrow(
      "under 10 MB",
    );
  });
});
