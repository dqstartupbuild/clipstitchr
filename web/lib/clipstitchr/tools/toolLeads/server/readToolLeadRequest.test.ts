import { describe, expect, it } from "vitest";
import { readToolLeadRequest } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadRequest";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { toolLeadMaxBodyBytes } from "@/lib/clipstitchr/tools/toolLeads/server/toolLeadMaxBodyBytes";

function createRequest(body: BodyInit, headers: HeadersInit = {}) {
  return new Request("https://clipstitchr.test/tool-lead", {
    body,
    headers,
    method: "POST",
  });
}

describe("readToolLeadRequest", () => {
  it("normalizes a bounded exact-shape JSON request", async () => {
    await expect(
      readToolLeadRequest(
        createRequest(
          JSON.stringify({
            email: " Founder@Example.COM ",
            name: "  Ada   Founder  ",
          }),
          { "content-type": "application/json; charset=utf-8" },
        ),
      ),
    ).resolves.toEqual({
      email: "founder@example.com",
      name: "Ada Founder",
    });
  });

  it("rejects non-JSON, malformed, invalid, and source-bearing requests", async () => {
    const requests = [
      createRequest("{}", { "content-type": "text/plain" }),
      createRequest("{", { "content-type": "application/json" }),
      createRequest(JSON.stringify({ email: "bad", name: "Ada" }), {
        "content-type": "application/json",
      }),
      createRequest(
        JSON.stringify({
          email: "ada@example.com",
          name: "Ada",
          source: "app-hook-generator",
        }),
        { "content-type": "application/json" },
      ),
    ];

    for (const request of requests) {
      await expect(readToolLeadRequest(request)).rejects.toBeInstanceOf(
        ToolLeadRequestError,
      );
    }
  });

  it("enforces declared and actual byte limits", async () => {
    await expect(
      readToolLeadRequest(
        createRequest("{}", {
          "content-length": String(toolLeadMaxBodyBytes + 1),
          "content-type": "application/json",
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
    await expect(
      readToolLeadRequest(
        createRequest(`"${"x".repeat(toolLeadMaxBodyBytes)}"`, {
          "content-type": "application/json",
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
  });
});
