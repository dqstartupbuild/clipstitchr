import { createStudioClipsRequestFingerprint } from "../studioClipsTasks/createStudioClipsRequestFingerprint";

export async function createStudioClipsOutputId(
  taskId: string,
  artifactId: string,
) {
  const digest = await createStudioClipsRequestFingerprint(
    `${taskId}:${artifactId}`,
  );
  return `output_${digest.slice(0, 32)}`;
}
