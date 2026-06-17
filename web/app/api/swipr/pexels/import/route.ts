import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createSwiprPexelsBackgroundMetadata } from "@/lib/clipstitchr/server/createSwiprPexelsBackgroundMetadata";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { downloadPexelsPhotoBytes } from "@/lib/clipstitchr/server/pexels/downloadPexelsPhotoBytes";
import { searchPexelsPhotoResults } from "@/lib/clipstitchr/server/pexels/searchPexelsPhotoResults";
import { readImageDimensionsFromBytes } from "@/lib/clipstitchr/server/readImageDimensionsFromBytes";
import { readSwiprLibraryQuery } from "@/lib/clipstitchr/server/readSwiprLibraryQuery";
import { readSwiprPexelsImportCount } from "@/lib/clipstitchr/server/readSwiprPexelsImportCount";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

type SwiprPexelsImportRequest = {
  count?: unknown;
  query?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const body = (await request.json()) as SwiprPexelsImportRequest;
    const query = readSwiprLibraryQuery(body.query);
    const count = readSwiprPexelsImportCount(body.count);
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumePexelsSearch, { secret });
    await convex.mutation(api.rateLimits.consumePexelsImport, {
      count,
      secret,
    });

    const photos = await searchPexelsPhotoResults({ perPage: count, query });
    const importedIds: string[] = [];

    for (const photo of photos) {
      const id = createId();
      const { bytes, contentType } = await downloadPexelsPhotoBytes(photo);
      const dimensions = readImageDimensionsFromBytes(bytes, contentType);
      const imageObject = await putR2Object({
        body: bytes,
        contentType,
        key: createR2ObjectKey({
          contentType,
          kind: "swipr-background",
          recordId: id,
          userId,
        }),
      });
      const metadata = createSwiprPexelsBackgroundMetadata({ photo, query });

      await convex.mutation(api.swiprBackgrounds.save, {
        id,
        createdAt: new Date().toISOString(),
        description: metadata.description,
        details: metadata.details,
        imageObject,
        libraryQuery: query,
        mimeType: imageObject.contentType,
        name: metadata.name,
        size: imageObject.size,
        source: "pexels",
        tags: metadata.tags,
        width: dimensions.width,
        height: dimensions.height,
      });
      importedIds.push(id);
    }

    return Response.json({
      imported: importedIds.length,
      ids: importedIds,
      query,
      searched: photos.length,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to import Pexels photos.",
      },
      { status: 400 },
    );
  }
}
