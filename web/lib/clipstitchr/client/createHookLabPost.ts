import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export async function createHookLabPost(url: string) {
  const response = await fetch("/api/hook-lab/posts", {
    body: JSON.stringify({ url }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    post?: HookLabPost;
  };

  if (!response.ok || !payload.post) {
    throw new Error(payload.message || "Unable to save that post.");
  }

  return payload.post;
}
