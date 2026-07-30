import { getInstagramGraphApiVersion } from "../../social/getInstagramGraphApiVersion";

export async function revokeInstagramAuthorization(
  externalAccountId: string,
  accessToken: string,
) {
  let response: Response;

  try {
    const url = new URL(
      `https://graph.instagram.com/${getInstagramGraphApiVersion()}/${encodeURIComponent(externalAccountId)}/permissions`,
    );
    url.searchParams.set("access_token", accessToken);
    response = await fetch(url, { method: "DELETE" });
  } catch {
    throw new Error(
      "Instagram could not be reached to disconnect this account.",
    );
  }

  if (response.status >= 500) {
    throw new Error("Instagram could not disconnect this account right now.");
  }
}
