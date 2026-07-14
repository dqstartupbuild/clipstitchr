import { describe, expect, it } from "vitest";
import { readPublicToolInteractionRequest } from "@/lib/clipstitchr/tools/publicToolGates/server/readPublicToolInteractionRequest";

const createRequest = (body: unknown, contentType = "application/json") =>
  new Request("https://clipstitchr.com/api/tools/app-hook-generator/interaction", {
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": contentType },
    method: "POST",
  });

describe("readPublicToolInteractionRequest", () => {
  it("accepts only one fixed interaction field", async () => {
    await expect(
      readPublicToolInteractionRequest(
        createRequest({ interactionType: "resourceUnlocked" }),
      ),
    ).resolves.toBe("resourceUnlocked");
  });

  it.each([
    { interactionType: "visitorSuppliedEvent" },
    { interactionType: "resultViewed", email: "person@example.com" },
    { interactionType: "resultViewed", result: "personalized answer" },
  ])("rejects undeclared or unbounded input", async (body) => {
    await expect(
      readPublicToolInteractionRequest(createRequest(body)),
    ).rejects.toMatchObject({ status: 400 });
  });
});
