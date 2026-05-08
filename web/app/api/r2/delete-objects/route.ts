import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { deleteR2Objects } from "@/lib/clipstitchr/server/r2/deleteR2Objects";
import { readR2DeleteObjectsRequest } from "@/lib/clipstitchr/server/r2/readR2DeleteObjectsRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { keys } = await readR2DeleteObjectsRequest(request);

    for (const key of keys) {
      assertR2ObjectKeyBelongsToUser(key, userId);
    }

    await deleteR2Objects(keys);

    return Response.json({ deleted: keys.length });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete R2 objects.",
      },
      { status: 400 },
    );
  }
}
