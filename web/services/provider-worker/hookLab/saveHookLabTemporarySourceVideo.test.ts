import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  putR2Object: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));

import { saveHookLabTemporarySourceVideo } from "./saveHookLabTemporarySourceVideo";

describe("saveHookLabTemporarySourceVideo", () => {
  it("stores the fetched bytes under a user-scoped MIME-derived key", async () => {
    const body = new Uint8Array([1, 2, 3]);

    mocks.putR2Object.mockResolvedValue({
      contentType: "video/webm",
      key: "users/owner_1/hook-lab-sources/job_1/source.webm",
      size: body.byteLength,
    });

    await saveHookLabTemporarySourceVideo({
      body,
      contentType: "video/webm",
      ownerId: "owner_1",
      recordId: "job_1",
    });

    expect(mocks.putR2Object).toHaveBeenCalledWith({
      body: expect.any(ArrayBuffer),
      contentType: "video/webm",
      key: "users/owner_1/hook-lab-sources/job_1/source.webm",
    });
    expect(
      new Uint8Array(mocks.putR2Object.mock.calls[0]?.[0].body),
    ).toEqual(body);
  });
});
