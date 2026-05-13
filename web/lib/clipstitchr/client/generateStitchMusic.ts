import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";

type GenerateStitchMusicOptions = {
  stitchId: string;
};

export async function generateStitchMusic({
  stitchId,
}: GenerateStitchMusicOptions) {
  const response = await fetch("/api/stitches/music", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ stitchId }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate stitch music.");
  }

  return ((await response.json()) as { music: StitchMusicMetadata }).music;
}
