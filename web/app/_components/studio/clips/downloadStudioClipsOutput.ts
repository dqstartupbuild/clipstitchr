import type { StudioClipsOutput } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsOutput";

export async function downloadStudioClipsOutput(
  output: StudioClipsOutput,
  getDownloadUrl: () => Promise<{ url: string } | null>,
) {
  const signed = await getDownloadUrl();
  if (!signed) {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = signed.url;
  anchor.download = output.fileName ?? `studio-clip-${output.artifactId}.mp4`;
  anchor.rel = "noopener";
  anchor.click();
}
