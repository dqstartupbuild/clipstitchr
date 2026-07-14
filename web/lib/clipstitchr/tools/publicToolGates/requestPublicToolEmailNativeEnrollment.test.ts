import { afterEach, describe, expect, it, vi } from "vitest";
import { requestPublicToolEmailNativeEnrollment } from "@/lib/clipstitchr/tools/publicToolGates/requestPublicToolEmailNativeEnrollment";

describe("requestPublicToolEmailNativeEnrollment", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends no contact data or workflow selection", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    await requestPublicToolEmailNativeEnrollment(
      "five-day-app-content-sprint",
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/tools/five-day-app-content-sprint/email-native-enrollment",
      {
        cache: "no-store",
        credentials: "same-origin",
        method: "POST",
      },
    );
    expect(JSON.stringify(fetch.mock.calls)).not.toMatch(
      /private@example\.com|workflowKey|recognitionToken|request body/i,
    );
  });
});
