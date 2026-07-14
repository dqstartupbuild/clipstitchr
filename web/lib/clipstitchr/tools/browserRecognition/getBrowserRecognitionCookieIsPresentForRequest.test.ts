import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBrowserRecognitionCookieIsPresentForRequest } from "@/lib/clipstitchr/tools/browserRecognition/getBrowserRecognitionCookieIsPresentForRequest";

const mocks = vi.hoisted(() => ({
  value: undefined as string | undefined,
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => (mocks.value ? { value: mocks.value } : undefined),
  })),
}));

describe("getBrowserRecognitionCookieIsPresentForRequest", () => {
  beforeEach(() => {
    mocks.value = undefined;
  });

  it("recognizes only the opaque cookie shape", async () => {
    await expect(
      getBrowserRecognitionCookieIsPresentForRequest(),
    ).resolves.toBe(false);

    mocks.value = "contact@example.com";
    await expect(
      getBrowserRecognitionCookieIsPresentForRequest(),
    ).resolves.toBe(false);

    mocks.value = "a".repeat(43);
    await expect(
      getBrowserRecognitionCookieIsPresentForRequest(),
    ).resolves.toBe(true);
  });
});
