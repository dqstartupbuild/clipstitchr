import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveCliprSceneVideoObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  jobId: string;
  sceneId: string;
  userId: string;
};

export function saveCliprSceneVideoObject({
  body,
  contentType,
  jobId,
  sceneId,
  userId,
}: SaveCliprSceneVideoObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "clipr-scene-video",
      recordId: `${jobId}-${sceneId}`,
      userId,
    }),
  });
}
