import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { deleteR2Objects } from "@/lib/clipstitchr/server/r2/deleteR2Objects";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export const runtime = "nodejs";

type AvatarRouteContext = {
  params: Promise<{ id: string }>;
};

type AvatarDeleteBundle = {
  photos: Array<{
    id: string;
    photoObject: R2ObjectReference;
    originalObject?: R2ObjectReference;
    thumbnailObject?: R2ObjectReference;
  }>;
};

function getAvatarDeleteObjectKeys(bundle: AvatarDeleteBundle) {
  return Array.from(
    new Set(
      bundle.photos.flatMap((photo) =>
        [photo.photoObject, photo.originalObject, photo.thumbnailObject]
          .filter((object): object is R2ObjectReference => Boolean(object))
          .map((object) => object.key),
      ),
    ),
  );
}

export async function DELETE(
  _request: Request,
  { params }: AvatarRouteContext,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { id } = await params;
    const avatarId = id.trim();

    if (!avatarId) {
      throw new Error("Missing avatar ID.");
    }

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const rateLimitSecret = getRateLimitApiSecret();
    const bundle = await convex.query(api.avatars.getDeleteBundle, {
      id: avatarId,
    });

    if (!bundle) {
      return NextResponse.json(
        { error: "Avatar not found." },
        { status: 404 },
      );
    }

    await convex.mutation(api.rateLimits.consumeAvatarCascadeDelete, {
      secret: rateLimitSecret,
    });

    const objectKeys = getAvatarDeleteObjectKeys(bundle);

    for (const key of objectKeys) {
      assertR2ObjectKeyBelongsToUser(key, userId);
    }

    await deleteR2Objects(objectKeys);

    const result = await convex.mutation(api.avatars.removeWithPhotos, {
      id: avatarId,
      photoIds: bundle.photos.map((photo) => photo.id),
      secret: rateLimitSecret,
    });

    return NextResponse.json({
      ...result,
      deletedObjectCount: objectKeys.length,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete avatar.",
      },
      { status: 500 },
    );
  }
}
