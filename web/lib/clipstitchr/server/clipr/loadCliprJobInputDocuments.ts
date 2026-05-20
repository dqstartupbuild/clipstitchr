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
  const [productDocument, avatarDocument, avatarPhotoDocument] =
    await Promise.all([
      convex.query(api.products.get, { id: input.productId }),
      convex.query(api.avatars.get, { id: input.avatarId }),
      convex.query(api.photoAssets.getFirstForAvatar, {
        avatarId: input.avatarId,
      }),
    ]);
  const selectedMusicTrack = input.musicTrackId
    ? await convex.query(api.sharedMusicTracks.get, { id: input.musicTrackId })
    : null;

  if (!productDocument) {
    throw new Error("Saved product not found.");
  }

  if (!avatarDocument) {
    throw new Error("Avatar not found.");
  }

  if (!avatarPhotoDocument) {
    throw new Error("Upload at least one photo for this avatar.");
  }

  if (input.musicTrackId && !selectedMusicTrack) {
    throw new Error("Selected music track was not found.");
  }

  return {
    avatar: avatarDocument,
    avatarPhoto: avatarPhotoDocument,
    product: createProductProfileFromConvexDocument(productDocument),
    selectedMusicTrack,
  };
}
