import { getJsonResponse } from "./getJsonResponse";

export async function disconnectSocialAccount(id: string) {
  const response = await fetch(
    `/api/social/accounts/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  return await getJsonResponse<{ heldTargetCount: number }>(response);
}
