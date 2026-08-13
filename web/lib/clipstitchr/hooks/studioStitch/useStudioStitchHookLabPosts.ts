"use client";

import { useHookLabPosts } from "@/lib/clipstitchr/hooks/useHookLabPosts";

export function useStudioStitchHookLabPosts() {
  const state = useHookLabPosts();
  return {
    ...state,
    posts: state.posts.filter((post) => post.status === "ready"),
  };
}
