import "server-only";

export function getStudioStitchMaterializationSecret() {
  const secret = process.env.STUDIO_STITCH_WORKER_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("Studio Stitch materialization is not configured.");
  }
  return secret;
}
