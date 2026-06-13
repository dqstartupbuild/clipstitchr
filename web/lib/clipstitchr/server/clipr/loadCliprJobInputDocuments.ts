import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/CliprJobInputDocuments";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";

type LoadCliprJobInputDocumentsOptions = Pick<CliprJobServerContext, "convex"> & {
  input: CliprJobCreateInput;
};

export async function loadCliprJobInputDocuments({
  convex,
  input,
}: LoadCliprJobInputDocumentsOptions): Promise<CliprJobInputDocuments> {
  const [productDocument, avatarDocument, avatarPhotoDocument, demoClipDocument] =
    await Promise.all([
      convex.query(api.products.get, { id: input.productId }),
      input.generationMode === "demo"
        ? Promise.resolve(null)
        : convex.query(api.avatars.get, { id: input.avatarId }),
      input.generationMode === "demo"
        ? Promise.resolve(null)
        : convex.query(api.photoAssets.getFirstForAvatar, {
            avatarId: input.avatarId,
          }),
      input.generationMode === "demo" && input.demoClipId
        ? convex.query(api.videoClips.get, { id: input.demoClipId })
        : Promise.resolve(null),
    ]);
  const selectedMusicTrack = input.musicTrackId
    ? await convex.query(api.sharedMusicTracks.get, { id: input.musicTrackId })
    : null;

  if (!productDocument) {
    throw new Error("Saved product not found.");
  }

  if (input.generationMode !== "demo" && !avatarDocument) {
    throw new Error("Avatar not found.");
  }

  if (input.generationMode !== "demo" && !avatarPhotoDocument) {
    throw new Error("Upload at least one photo for this avatar.");
  }

  if (input.generationMode === "demo" && !demoClipDocument) {
    throw new Error("Selected demo video was not found.");
  }

  if (
    input.generationMode === "demo" &&
    demoClipDocument &&
    demoClipDocument.clipType !== "demo"
  ) {
    throw new Error("Choose a saved demo video.");
  }

  if (input.musicTrackId && !selectedMusicTrack) {
    throw new Error("Selected music track was not found.");
  }

  return {
    avatar: avatarDocument,
    avatarPhoto: avatarPhotoDocument,
    demoClip: demoClipDocument,
    product: createProductProfileFromConvexDocument(productDocument),
    selectedMusicTrack,
  };
}
