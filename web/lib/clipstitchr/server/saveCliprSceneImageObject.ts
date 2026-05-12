import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveCliprSceneImageObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  jobId: string;
  sceneId: string;
  userId: string;
};

export function saveCliprSceneImageObject({
  body,
  contentType,
  jobId,
  sceneId,
  userId,
}: SaveCliprSceneImageObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "clipr-scene-image",
      recordId: `${jobId}-${sceneId}`,
      userId,
    }),
  });
}
