import { describe, expect, it } from "vitest";
import { emailConfirmationMaxBodyBytes } from "@/lib/clipstitchr/email/confirmation/emailConfirmationMaxBodyBytes";
import { readEmailConfirmationBodyText } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationBodyText";

describe("readEmailConfirmationBodyText", () => {
  it("rejects declared and streamed bodies above the fixed cap", async () => {
    const declaredRequest = new Request(
      "https://clipstitchr.com/email/confirm",
      {
        body: "small",
        headers: {
          "content-length": String(emailConfirmationMaxBodyBytes + 1),
        },
        method: "POST",
      },
    );
    const streamedRequest = new Request(
      "https://clipstitchr.com/email/confirm",
      {
        body: "x".repeat(emailConfirmationMaxBodyBytes + 1),
        method: "POST",
      },
    );

    await expect(readEmailConfirmationBodyText(declaredRequest)).rejects.toMatchObject(
      { status: 413 },
    );
    await expect(readEmailConfirmationBodyText(streamedRequest)).rejects.toMatchObject(
      { status: 413 },
    );
  });
});
