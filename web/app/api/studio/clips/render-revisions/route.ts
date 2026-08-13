import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsRenderRevisionRequest } from "../_lib/readStudioClipsRenderRevisionRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await readStudioClipsRenderRevisionRequest(request);
    const { convex } = await getStudioClipsAuthenticatedClient();
    const result = await convex.mutation(
      api.studioClipsRenderRevisions.create.create,
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
      "Unable to create this Studio Clips render revision.",
    );
  }
}
