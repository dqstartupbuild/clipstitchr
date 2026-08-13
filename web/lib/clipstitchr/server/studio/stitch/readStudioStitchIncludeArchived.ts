export function readStudioStitchIncludeArchived(request: Request) {
  const value = new URL(request.url).searchParams.get("includeArchived");
  if (value === null || value === "false") return false;
  if (value === "true") return true;

  throw new Error("includeArchived must be true or false.");
}
