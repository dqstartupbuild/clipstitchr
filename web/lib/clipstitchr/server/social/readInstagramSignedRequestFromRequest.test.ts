import { beforeEach, describe, expect, it, vi } from "vitest";
import { readInstagramSignedRequestFromRequest } from "./readInstagramSignedRequestFromRequest";

const mocks = vi.hoisted(() => ({
  readInstagramSignedRequest: vi.fn(),
}));

vi.mock("./readInstagramSignedRequest", () => ({
  readInstagramSignedRequest: mocks.readInstagramSignedRequest,
}));

describe("readInstagramSignedRequestFromRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads Meta's URL-encoded signed_request field", async () => {
    mocks.readInstagramSignedRequest.mockReturnValue({ user_id: "account_1" });
    const request = new Request("https://clipstitchr.com/deauthorize", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "signed_request=signature.payload",
    });

    await expect(
      readInstagramSignedRequestFromRequest(request),
    ).resolves.toEqual({ user_id: "account_1" });
    expect(mocks.readInstagramSignedRequest).toHaveBeenCalledWith(
      "signature.payload",
    );
  });

  it("rejects a callback without a signed request", async () => {
    const request = new Request("https://clipstitchr.com/deauthorize", {
      method: "POST",
      body: "other=value",
    });

    await expect(
      readInstagramSignedRequestFromRequest(request),
    ).rejects.toThrow("missing");
  });
});
