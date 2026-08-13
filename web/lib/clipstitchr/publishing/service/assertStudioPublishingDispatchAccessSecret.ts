import { getConstantTimeStringsAreEqual } from "@/lib/clipstitchr/email/confirmation/getConstantTimeStringsAreEqual";

export function assertStudioPublishingDispatchAccessSecret(request: Request) {
  const supplied =
    request.headers.get("x-clipstitchr-publishing-dispatch-secret") ?? "";
  const expected = process.env.STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET ?? "";

  if (
    expected.length < 32 ||
    !getConstantTimeStringsAreEqual(supplied, expected)
  ) {
    throw new Error("Unable to authorize this publishing dispatch request.");
  }
}
