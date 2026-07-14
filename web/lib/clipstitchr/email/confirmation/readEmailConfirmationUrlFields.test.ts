import { describe, expect, it } from "vitest";
import { readEmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/readEmailConfirmationUrlFields";

const tokenRecordId = "123e4567-e89b-42d3-a456-426614174000";

function createValidUrl() {
  const url = new URL("https://clipstitchr.com/email/confirm");
  url.searchParams.set("id", tokenRecordId);
  url.searchParams.set("expires", "1783958400000");
  url.searchParams.set("signature", "s".repeat(43));
  return url;
}

describe("readEmailConfirmationUrlFields", () => {
  it("accepts the exact signed-link field shape", () => {
    expect(readEmailConfirmationUrlFields(createValidUrl())).toEqual({
      expires: "1783958400000",
      signature: "s".repeat(43),
      tokenRecordId,
    });
  });

  it("rejects duplicate, extra, missing, and malformed fields", () => {
    const duplicate = createValidUrl();
    duplicate.searchParams.append("id", tokenRecordId);
    const extra = createValidUrl();
    extra.searchParams.set("utm_source", "mail");
    const missing = createValidUrl();
    missing.searchParams.delete("signature");
    const malformed = createValidUrl();
    malformed.searchParams.set("id", "not-an-id");

    expect(readEmailConfirmationUrlFields(duplicate)).toBeNull();
    expect(readEmailConfirmationUrlFields(extra)).toBeNull();
    expect(readEmailConfirmationUrlFields(missing)).toBeNull();
    expect(readEmailConfirmationUrlFields(malformed)).toBeNull();
  });
});
