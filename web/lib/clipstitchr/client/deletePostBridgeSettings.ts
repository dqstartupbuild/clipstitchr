import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeSettings } from "@/lib/clipstitchr/types/PostBridgeSettings";

export async function deletePostBridgeSettings() {
  const response = await fetch("/api/post-bridge/settings", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to remove Post Bridge settings.",
      ),
    );
  }

  return ((await response.json()) as { settings: PostBridgeSettings }).settings;
}
