import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";

type GenerateCliprMusicOptions = {
  clipId: string;
};

export async function generateCliprMusic({ clipId }: GenerateCliprMusicOptions) {
  const response = await fetch("/api/clipr/music", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ clipId }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate Clipr music.");
  }

  return ((await response.json()) as { music: CliprMusicMetadata }).music;
}
