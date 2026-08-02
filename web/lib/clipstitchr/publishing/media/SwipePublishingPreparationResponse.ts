import type { SwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundle";
import type { SwipePublishingSlideUploadGrant } from "@/lib/clipstitchr/publishing/media/SwipePublishingSlideUploadGrant";

export type SwipePublishingPreparationResponse =
  | {
      bundle: SwipePublishingBundle;
      status: "reusable";
    }
  | {
      revision: string;
      status: "render_required";
    }
  | {
      attemptId: string;
      grants: SwipePublishingSlideUploadGrant[];
      revision: string;
      status: "upload";
    };
