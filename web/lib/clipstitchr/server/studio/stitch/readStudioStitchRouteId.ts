export async function readStudioStitchRouteId(context: {
  readonly params: Promise<{ readonly id: string }>;
}) {
  const id = (await context.params).id.trim();
  if (!id || id.length > 120) {
    throw new Error("A valid Studio Stitch record ID is required.");
  }

  return id;
}
