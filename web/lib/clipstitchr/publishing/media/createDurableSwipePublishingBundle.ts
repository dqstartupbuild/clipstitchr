import type { GetSwipePublishingUploadAttempt } from "@/lib/clipstitchr/publishing/media/GetSwipePublishingUploadAttempt";
import { requestSwipePublishingPreparation } from "@/lib/clipstitchr/publishing/media/requestSwipePublishingPreparation";
import { renderSwipePublishingSlideBlobs } from "@/lib/clipstitchr/publishing/media/renderSwipePublishingSlideBlobs";
import { requestSwipePublishingBundleCommit } from "@/lib/clipstitchr/publishing/media/requestSwipePublishingBundleCommit";
import type { SwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundle";
import { uploadSwipePublishingSlideBlobs } from "@/lib/clipstitchr/publishing/media/uploadSwipePublishingSlideBlobs";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

type CreateDurableSwipePublishingBundleOptions = {
  backgroundsById: Map<string, SwiprBackgroundAsset>;
  loadBackgroundBlob: (id: string) => Promise<Blob>;
  getAttempt: GetSwipePublishingUploadAttempt;
  swipe: SwiprSwipe;
};

export async function createDurableSwipePublishingBundle({
  backgroundsById,
  loadBackgroundBlob,
  getAttempt,
  swipe,
}: CreateDurableSwipePublishingBundleOptions): Promise<SwipePublishingBundle> {
  const preparation = await requestSwipePublishingPreparation({
    swipeId: swipe.id,
  });

  if (preparation.status === "reusable") {
    return preparation.bundle;
  }

  if (preparation.status !== "render_required") {
    throw new Error("Swipe publishing preparation did not return a revision.");
  }

  const blobs = await renderSwipePublishingSlideBlobs({
    backgroundsById,
    loadBackgroundBlob,
    swipe,
  });
  const upload = await uploadSwipePublishingSlideBlobs({
    blobs,
    revision: preparation.revision,
    swipeId: swipe.id,
  });

  if (upload.status === "reusable") {
    return upload.bundle;
  }

  try {
    return await requestSwipePublishingBundleCommit({
      attemptId: upload.attemptId,
    });
  } catch (firstCommitError) {
    const firstReconciliation = await getAttempt({
      attemptId: upload.attemptId,
    });

    if (firstReconciliation?.status === "committed") {
      return firstReconciliation.bundle;
    }

    try {
      return await requestSwipePublishingBundleCommit({
        attemptId: upload.attemptId,
      });
    } catch (secondCommitError) {
      const secondReconciliation = await getAttempt({
        attemptId: upload.attemptId,
      });

      if (secondReconciliation?.status === "committed") {
        return secondReconciliation.bundle;
      }

      throw new AggregateError(
        [firstCommitError, secondCommitError],
        "Swipe publishing commit could not be confirmed. Immutable media remains reserved for retry or deferred cleanup.",
      );
    }
  }
}
