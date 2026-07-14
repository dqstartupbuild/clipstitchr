import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/tools/[tool]/email-native-enrollment/route";

const mocks = vi.hoisted(() => ({
  handleEmailNativeEnrollmentRequest: vi.fn(async () =>
    Response.json({ accepted: true }),
  ),
}));

vi.mock(
  "@/lib/clipstitchr/tools/toolLeads/server/handleEmailNativeEnrollmentRequest",
  () => ({
    handleEmailNativeEnrollmentRequest:
      mocks.handleEmailNativeEnrollmentRequest,
  }),
);

describe("email-native enrollment route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates a known tool without reading a request body", async () => {
    const request = new Request(
      "https://clipstitchr.test/api/tools/five-day-app-content-sprint/email-native-enrollment",
      { method: "POST" },
    );

    const response = await POST(request, {
      params: Promise.resolve({ tool: "five-day-app-content-sprint" }),
    });

    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(mocks.handleEmailNativeEnrollmentRequest).toHaveBeenCalledWith({
      request,
      source: "five-day-app-content-sprint",
    });
  });

  it("returns a private 404 for an unknown tool", async () => {
    const response = await POST(
      new Request(
        "https://clipstitchr.test/api/tools/not-a-tool/email-native-enrollment",
        { method: "POST" },
      ),
      { params: Promise.resolve({ tool: "not-a-tool" }) },
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(mocks.handleEmailNativeEnrollmentRequest).not.toHaveBeenCalled();
  });
});
