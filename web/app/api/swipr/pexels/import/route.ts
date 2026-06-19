import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createSwiprPexelsBackgroundMetadata } from "@/lib/clipstitchr/server/createSwiprPexelsBackgroundMetadata";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { downloadPexelsPhotoBytes } from "@/lib/clipstitchr/server/pexels/downloadPexelsPhotoBytes";
import { getPexelsSearchPage } from "@/lib/clipstitchr/server/pexels/getPexelsSearchPage";
import { searchPexelsPhotoResults } from "@/lib/clipstitchr/server/pexels/searchPexelsPhotoResults";
import { readImageDimensionsFromBytes } from "@/lib/clipstitchr/server/readImageDimensionsFromBytes";
import { readSwiprLibraryQuery } from "@/lib/clipstitchr/server/readSwiprLibraryQuery";
import { readSwiprPexelsImportCount } from "@/lib/clipstitchr/server/readSwiprPexelsImportCount";
import { readSwiprPexelsImportPhotos } from "@/lib/clipstitchr/server/readSwiprPexelsImportPhotos";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getImportedPexelsPhotoIds } from "@/lib/clipstitchr/utils/getImportedPexelsPhotoIds";
import { getSwiprLibraryQueryForImport } from "@/lib/clipstitchr/utils/getSwiprLibraryQueryForImport";

export const runtime = "nodejs";

type SwiprPexelsImportRequest = {
  count?: unknown;
  page?: unknown;
  photos?: unknown;
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
    const loadedPhotos = readSwiprPexelsImportPhotos(body.photos);
    const count = loadedPhotos
      ? loadedPhotos.length
      : readSwiprPexelsImportCount(body.count);
    const page = getPexelsSearchPage(body.page);
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    if (!loadedPhotos) {
      await convex.mutation(api.rateLimits.consumePexelsSearch, { secret });
    }

    const photos: PexelsPhotoResult[] =
      loadedPhotos ??
      (await searchPexelsPhotoResults({
        page,
        perPage: count,
        query,
      }));
    const backgrounds = await convex.query(
      api.swiprBackgrounds.listGlobalPexels,
      {},
    );
    const existingPexelsPhotoIds = getImportedPexelsPhotoIds(backgrounds);
    const photosToImport = photos.filter(
      (photo) => !existingPexelsPhotoIds.has(photo.id),
    );
    const libraryQuery = getSwiprLibraryQueryForImport(backgrounds, query);
    const importedIds: string[] = [];
    const importedPhotoIds: number[] = [];

    if (photosToImport.length) {
      await convex.mutation(api.rateLimits.consumePexelsImport, {
        count: photosToImport.length,
        secret,
      });
    }

    for (const photo of photosToImport) {
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
      const metadata = createSwiprPexelsBackgroundMetadata({
        photo,
        query: libraryQuery,
      });

      await convex.mutation(api.swiprBackgrounds.save, {
        id,
        createdAt: new Date().toISOString(),
        description: metadata.description,
        details: metadata.details,
        imageObject,
        libraryQuery,
        mimeType: imageObject.contentType,
        name: metadata.name,
        pexelsPhotoId: photo.id,
        size: imageObject.size,
        source: "pexels",
        tags: metadata.tags,
        width: dimensions.width,
        height: dimensions.height,
      });
      importedIds.push(id);
      importedPhotoIds.push(photo.id);
    }

    await convex.mutation(api.swiprBackgrounds.addLibraryPackToAccount, {
      libraryQuery,
    });

    return Response.json({
      imported: importedIds.length,
      importedPexelsPhotoIds: importedPhotoIds,
      ids: importedIds,
      page,
      query: libraryQuery,
      searched: photos.length,
      skipped: photos.length - photosToImport.length,
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
