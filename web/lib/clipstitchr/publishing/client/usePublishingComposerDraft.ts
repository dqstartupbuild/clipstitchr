"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerDraft";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingThumbnailSelection } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailSelection";
import { createEmptyPublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/createEmptyPublishingComposerDraft";
import { createPublishingComposerIdempotencyKey } from "@/lib/clipstitchr/publishing/client/createPublishingComposerIdempotencyKey";
import { readStoredPublishingComposerDraft } from "@/lib/clipstitchr/publishing/client/readStoredPublishingComposerDraft";
import { getBrowserTimeZone } from "@/lib/clipstitchr/publishing/client/schedule/getBrowserTimeZone";
import { getPublishingComposerStorageKey } from "@/lib/clipstitchr/publishing/client/getPublishingComposerStorageKey";

export function usePublishingComposerDraft(
  productId: string,
  initialMedia: PublishingMediaDescriptor | null,
  initialThumbnail: PublishingThumbnailSelection | null,
) {
  const [draft, setDraft] = useState<PublishingComposerDraft>(() =>
    createEmptyPublishingComposerDraft(initialMedia),
  );
  const [isRestored, setIsRestored] = useState(false);
  const storageKey = getPublishingComposerStorageKey(productId);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      let storedValue: string | null = null;
      try {
        storedValue = window.sessionStorage.getItem(storageKey);
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
      const settingsByIntegrationId = Object.fromEntries(
        Object.entries(base.settingsByIntegrationId).map(
          ([integrationId, settings]) => [
            integrationId,
            settings.provider === "youtube" && initialThumbnail
              ? { ...settings, thumbnail: initialThumbnail }
              : settings,
          ],
        ),
      );

      setDraft({
        ...base,
        idempotencyKey:
          mediaChanged || !base.idempotencyKey
            ? createPublishingComposerIdempotencyKey()
            : base.idempotencyKey,
        media,
        settingsByIntegrationId,
        timeZone: stored?.timeZone || getBrowserTimeZone(),
      });
      setIsRestored(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialMedia, initialThumbnail, storageKey]);

  useEffect(() => {
    if (!isRestored) {
      return;
    }
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // The in-memory draft remains usable when browser storage is unavailable.
    }
  }, [draft, isRestored, storageKey]);

  const reset = useCallback(
    (media: PublishingMediaDescriptor | null = initialMedia) => {
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        // The new in-memory draft still replaces the old one for this session.
      }
      setDraft({
        ...createEmptyPublishingComposerDraft(media),
        idempotencyKey: createPublishingComposerIdempotencyKey(),
        timeZone: getBrowserTimeZone(),
      });
    },
    [initialMedia, storageKey],
  );

  return { draft, isRestored, reset, setDraft };
}
