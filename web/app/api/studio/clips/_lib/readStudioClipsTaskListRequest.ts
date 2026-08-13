import { readStudioClipsProductId } from "./readStudioClipsProductId";

export function readStudioClipsTaskListRequest(request: Request) {
  const url = new URL(request.url);
  const allowed = new Set(["includeArchived", "limit", "productId"]);
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) {
    throw new Error("The Studio Clips list request contains unsupported fields.");
  }
  const limitText = url.searchParams.get("limit");
  const limit = limitText === null ? undefined : Number(limitText);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
    throw new Error("Studio Clips list limit must be between 1 and 100.");
  }
  const archivedText = url.searchParams.get("includeArchived");
  if (archivedText !== null && archivedText !== "true" && archivedText !== "false") {
    throw new Error("Studio Clips archive filter is invalid.");
  }
  return {
    ...(archivedText !== null ? { includeArchived: archivedText === "true" } : {}),
    ...(limit !== undefined ? { limit } : {}),
    productId: readStudioClipsProductId(request),
  };
}
