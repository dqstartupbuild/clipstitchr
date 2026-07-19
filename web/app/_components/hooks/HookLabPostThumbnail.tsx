"use client";

import { useCallback } from "react";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import { useLazyBlobObjectUrl } from "@/lib/clipstitchr/hooks/useLazyBlobObjectUrl";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { getHookLabPostTitle } from "@/lib/clipstitchr/utils/getHookLabPostTitle";

export function HookLabPostThumbnail({ post }: { post: HookLabPost }) {
  const loadThumbnailBlob = useCallback(async () => {
    if (!post.thumbnailObject) {
      return null;
    }

    const blobsByKey = await downloadCachedR2ImageBlobs([
      post.thumbnailObject,
    ]);

    return blobsByKey.get(post.thumbnailObject.key) ?? null;
  }, [post.thumbnailObject]);
  const thumbnailUrl = useLazyBlobObjectUrl({
    cacheKey: post.thumbnailObject?.key,
    loadBlob: loadThumbnailBlob,
  });

  return (
    <div className="aspect-[9/12] overflow-hidden bg-[#dce4df]">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`Preview of ${getHookLabPostTitle(post)}`}
          className="size-full object-cover"
          loading="lazy"
          src={thumbnailUrl}
        />
      ) : (
        <div className="flex size-full items-center justify-center p-6 text-center text-sm font-semibold leading-6 text-[#46504b]">
          {post.status === "analyzing"
            ? "Watching the full video..."
            : "Video preview unavailable"}
        </div>
      )}
    </div>
  );
}
