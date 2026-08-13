export function assertStudioClipsWorkerSecret(secret: string) {
  const expected = process.env.STUDIO_CLIPS_WORKER_SECRET ?? "";
  let difference = secret.length ^ expected.length;
  const length = Math.max(secret.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    difference |=
      (secret.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  if (expected.length < 32 || difference !== 0) {
    throw new Error("Unauthorized Studio Clips worker request.");
  }
}
