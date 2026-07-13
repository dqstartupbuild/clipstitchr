import { afterEach, describe, expect, it, vi } from "vitest";
import { generateAppHooks } from "@/lib/clipstitchr/tools/appHookGenerator/generateAppHooks";

const input = {
  appName: "ClipStitchr",
  audience: "app founders",
  desiredOutcome: "launch better app ads",
  edgeLevel: "punchy" as const,
  problem: "writing short-form hooks",
  variationIndex: 4,
};

describe("generateAppHooks", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the input to the public generator endpoint", async () => {
    const result = { hooks: [], variationIndex: 4 };
    const fetchMock = vi.fn(async () =>
      Response.json(result, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateAppHooks(input)).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith("/api/tools/app-hook-generator", {
      body: JSON.stringify(input),
      headers: { "content-type": "application/json" },
      method: "POST",
      signal: undefined,
    });
  });

  it("passes cancellation through to the request", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn(async () =>
      Response.json({ hooks: [], variationIndex: 4 }, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await generateAppHooks(input, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tools/app-hook-generator",
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it.each([
    [400, "Check each field, then try again."],
    [403, "Check each field, then try again."],
    [413, "Check each field, then try again."],
    [415, "Check each field, then try again."],
    [429, "You have made a bunch of hook sets. Give it a minute, then try again."],
    [500, "The hook generator is having trouble right now. Try again soon."],
  ])("maps status %i to useful copy", async (status, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({}, { status })),
    );

    await expect(generateAppHooks(input)).rejects.toThrow(message);
  });
});
