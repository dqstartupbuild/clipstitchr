import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export async function requestPublicToolEmailNativeEnrollment(
  toolKey: PublicToolKey,
) {
  const response = await fetch(
    `/api/tools/${toolKey}/email-native-enrollment`,
    {
      cache: "no-store",
      credentials: "same-origin",
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Enrollment request was not accepted.");
  }
}
