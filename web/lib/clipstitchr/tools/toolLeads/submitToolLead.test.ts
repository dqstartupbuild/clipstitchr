import { afterEach, describe, expect, it, vi } from "vitest";
import { submitToolLead } from "@/lib/clipstitchr/tools/toolLeads/submitToolLead";

describe("submitToolLead", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts contact fields to the source-specific allowlisted endpoint", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ accepted: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      submitToolLead({
        email: "ada@example.com",
        name: "Ada Founder",
        source: "app-hook-generator",
      }),
    ).resolves.toEqual({ accepted: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tools/app-hook-generator/lead",
      expect.objectContaining({
        body: JSON.stringify({
          email: "ada@example.com",
          name: "Ada Founder",
        }),
        credentials: "same-origin",
        method: "POST",
      }),
    );
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).not.toContain("source");
  });

  it("supports every typed tool source without sending its source in JSON", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ accepted: true }));
    vi.stubGlobal("fetch", fetchMock);

    await submitToolLead({
      email: "ada@example.com",
      name: "Ada Founder",
      source: "product-demo-readiness-checker",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/tools/product-demo-readiness-checker/lead",
    );
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).not.toContain("source");
  });

  it("accepts only the opaque one-field success response", async () => {
    for (const response of [
      Response.json({ accepted: true, status: "created" }),
      Response.json({ accepted: false }),
      Response.json({ message: "No" }, { status: 400 }),
    ]) {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => response),
      );

      await expect(
        submitToolLead({
          email: "ada@example.com",
          name: "Ada Founder",
          source: "app-hook-generator",
        }),
      ).rejects.toThrow("Unable to join the mailing list.");
    }
  });
});
