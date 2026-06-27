import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeSettings } from "@/lib/clipstitchr/types/PostBridgeSettings";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export async function savePostBridgeSettings(apiKey: string) {
  const response = await fetch("/api/post-bridge/settings", {
    body: JSON.stringify({ apiKey }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to save Post Bridge settings.",
      ),
    );
  }

  return (await response.json()) as {
    accounts: PostBridgeSocialAccount[];
    settings: PostBridgeSettings;
  };
}
