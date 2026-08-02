"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import { createEmptyPublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/createEmptyPublishingComposerDraft";
import { createPublishingComposerIdempotencyKey } from "@/lib/clipstitchr/publishing/client/createPublishingComposerIdempotencyKey";
import { readStoredPublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/readStoredPublishingComposerDraft";
import { getBrowserTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/getBrowserTimeZone";

const STORAGE_KEY = "clipstitchr:publishing-composer-draft:v1";

export function usePublishingComposerDraft(
  initialMedia: PublishingMediaDescriptor | null,
) {
  const [draft, setDraft] = useState<PublishingComposerDraft>(() =>
    createEmptyPublishingComposerDraft(initialMedia),
  );
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      let storedValue: string | null = null;
      try {
        storedValue = window.sessionStorage.getItem(STORAGE_KEY);
      } catch {
        storedValue = null;
      }
      const stored = readStoredPublishingComposerDraft(storedValue);
      const base = stored ?? createEmptyPublishingComposerDraft(initialMedia);
      const media = initialMedia ?? base.media;
      const mediaChanged =
        Boolean(initialMedia) &&
        (base.media?.kind !== initialMedia?.kind ||
          base.media?.recordId !== initialMedia?.recordId);

      setDraft({
        ...base,
        idempotencyKey:
          mediaChanged || !base.idempotencyKey
            ? createPublishingComposerIdempotencyKey()
            : base.idempotencyKey,
        media,
        timeZone: stored?.timeZone || getBrowserTimeZone(),
      });
      setIsRestored(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialMedia]);

  useEffect(() => {
    if (!isRestored) {
      return;
    }
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // The in-memory draft remains usable when browser storage is unavailable.
    }
  }, [draft, isRestored]);

  const reset = useCallback(
    (media: PublishingMediaDescriptor | null = initialMedia) => {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // The new in-memory draft still replaces the old one for this session.
      }
      setDraft({
        ...createEmptyPublishingComposerDraft(media),
        idempotencyKey: createPublishingComposerIdempotencyKey(),
        timeZone: getBrowserTimeZone(),
      });
    },
    [initialMedia],
  );

  return { draft, isRestored, reset, setDraft };
}
