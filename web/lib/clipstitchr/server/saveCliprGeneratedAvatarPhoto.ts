import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { readImageDimensionsFromBytes } from "@/lib/clipstitchr/server/readImageDimensionsFromBytes";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import { getAvatarGenerationTags } from "@/lib/clipstitchr/utils/getAvatarGenerationTags";
import { getImageNeedsSwaprOutpaint } from "@/lib/clipstitchr/utils/getImageNeedsSwaprOutpaint";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type SaveCliprGeneratedAvatarPhotoOptions = {
  avatarDescription?: string;
  avatarId: string;
  avatarName: string;
  body: ArrayBuffer;
  contentType: string;
  convex: ConvexHttpClient;
  createdAt: string;
  photoId: string;
  productId?: string;
  scene: CliprScenePlan;
  userId: string;
};

export async function saveCliprGeneratedAvatarPhoto({
  avatarDescription,
  avatarId,
  avatarName,
  body,
  contentType,
  convex,
  createdAt,
  photoId,
  productId,
  scene,
  userId,
}: SaveCliprGeneratedAvatarPhotoOptions) {
  const dimensions = readImageDimensionsFromBytes(body, contentType);
  const [photoObject, thumbnailObject] = await Promise.all([
    putR2Object({
      body,
      contentType,
      key: createR2ObjectKey({
        contentType,
        kind: "photo",
        recordId: photoId,
        userId,
      }),
    }),
    putR2Object({
      body,
      contentType,
      key: createR2ObjectKey({
        contentType,
        kind: "photo-thumbnail",
        recordId: photoId,
        userId,
      }),
    }),
  ]);
  const sourceName = avatarName.trim() || "Avatar";
  const extension = getMimeTypeFileExtension(contentType, "jpg");

  await convex.mutation(api.photoAssets.save, {
    id: photoId,
    productId,
    avatarId,
    name: `${sourceName} - Clipr source ${createdAt.slice(0, 10)}`,
    tags: normalizeAssetTagsWithRequiredTag(
      [
        ...getAvatarGenerationTags({
          lighting: "natural",
          location: scene.visualPrompt,
          style: "ugc",
        }),
        "clipr",
      ],
      "photo",
    ),
    avatarDescription,
    outfitDescription:
      "Casual creator clothing that fits the Clipr scene and looks believable for UGC.",
    locationDescription: scene.visualPrompt,
    poseDescription: scene.scriptText,
    originalName: `${sourceName}-clipr-source.${extension}`,
    photoObject,
    thumbnailObject,
    mimeType: contentType,
    size: body.byteLength,
    width: dimensions.width,
    height: dimensions.height,
    originalWidth: dimensions.width,
    originalHeight: dimensions.height,
    preparation: getImageNeedsSwaprOutpaint(dimensions.width, dimensions.height)
      ? undefined
      : "original-portrait",
    createdAt,
    updatedAt: createdAt,
  });

  return photoId;
}
