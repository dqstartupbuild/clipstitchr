import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsProductStyleRequest } from "../_lib/readStudioClipsProductStyleRequest";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const input = await readStudioClipsProductStyleRequest(request);
    const { convex } = await getStudioClipsAuthenticatedClient();
    const result = await convex.mutation(
      api.studioClipsProductStyles.upsert.upsert,
      {
        ...input,
        id: `clip_revision_${randomUUID().replaceAll("-", "")}`,
      },
    );
    return createStudioClipsPrivateJsonResponse(result, {
      status: result.created ? 201 : 200,
    });
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to save the Studio Clips Product style.",
    );
  }
}
