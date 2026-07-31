import { describe, expect, it } from "vitest";
import { SocialApiError } from "./SocialApiError";
import { readSocialApiResponse } from "./readSocialApiResponse";

describe("readSocialApiResponse", () => {
  it("keeps the provider error code for safe recovery decisions", async () => {
    const response = Response.json(
      {
        error: {
          code: "scope_not_authorized",
          message: "The requested scope was not granted.",
        },
      },
      { status: 401 },
    );

    const error = await readSocialApiResponse(
      response,
      "Provider failed.",
    ).catch((nextError: unknown) => nextError);

    expect(error).toBeInstanceOf(SocialApiError);
    expect(error).toMatchObject({
      message: "The requested scope was not granted.",
      providerCode: "scope_not_authorized",
      responseStatus: 401,
    });
  });
});
