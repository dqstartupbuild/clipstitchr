"use client";

import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchHookLabBriefPicker({
  posts,
  selectedPostId,
  onSelect,
}: {
  posts: readonly HookLabPost[];
  selectedPostId: string;
  onSelect: (id: string) => void;
}) {
  if (posts.length === 0) return null;
  return (
    <label className={styles.field}>
      Approved Hook Lab source
      <select
        onChange={(event) => onSelect(event.target.value)}
        value={selectedPostId}
      >
        <option value="">No Hook Lab brief selected</option>
        {posts.map((post) => (
          <option key={post.id} value={post.id}>
            {post.authorUsername ? `@${post.authorUsername}` : post.platform} - {post.sourceText?.slice(0, 64) || post.canonicalUrl}
          </option>
        ))}
      </select>
      <small>
        Only an approved brief saved for Stitchr will become selectable.
      </small>
    </label>
  );
}
