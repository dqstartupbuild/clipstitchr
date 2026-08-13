import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsCreateRequest } from "../_lib/readStudioClipsCreateRequest";
import { readStudioClipsTaskListRequest } from "../_lib/readStudioClipsTaskListRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const input = readStudioClipsTaskListRequest(request);
    const { convex } = await getStudioClipsAuthenticatedClient();
    await convex.mutation(
      api.studioClipsRateLimits.reserveStaticRead.reserveStaticRead,
      { productId: input.productId },
    );
    const tasks = await convex.query(api.studioClipsTasks.list.list, input);
    return createStudioClipsPrivateJsonResponse({ tasks });
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to list Studio Clips tasks.",
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = await readStudioClipsCreateRequest(request);
    const { convex } = await getStudioClipsAuthenticatedClient();
    const result = await convex.mutation(api.studioClipsTasks.create.create, {
      ...input,
      id: `task_${randomUUID().replaceAll("-", "")}`,
    });
    return createStudioClipsPrivateJsonResponse(result, {
      status: result.created ? 201 : 200,
    });
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to create Studio Clips task.",
    );
  }
}
