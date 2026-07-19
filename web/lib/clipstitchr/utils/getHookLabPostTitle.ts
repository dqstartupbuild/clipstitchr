import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function getHookLabPostTitle(post: HookLabPost) {
  if (post.authorUsername) {
    return `@${post.authorUsername.replace(/^@/, "")}`;
  }

  if (post.authorName) {
    return post.authorName;
  }

  return post.platform === "tiktok" ? "TikTok post" : "Instagram post";
}
