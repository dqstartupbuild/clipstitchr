import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeAccountOptions } from "@/lib/clipstitchr/types/PostBridgeAccountOptions";

export async function fetchPostBridgeAccountOptions(productId?: string) {
  const url = new URL("/api/post-bridge/accounts", window.location.origin);

  if (productId) {
    url.searchParams.set("productId", productId);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to load connected accounts.",
      ),
    );
  }

  return (await response.json()) as PostBridgeAccountOptions;
}
