import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { SwiprSelectedSlideTextContext } from "@/lib/clipstitchr/types/SwiprSelectedSlideTextContext";

type GenerateCliprTextOptions = {
  durationSeconds?: CliprDurationSeconds;
  productId: string;
  purpose: CliprTextPurpose;
  slideCount?: number;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
  swiprSelectedSlideTextContext?: SwiprSelectedSlideTextContext;
};

export async function generateCliprText(options: GenerateCliprTextOptions) {
  const response = await fetch("/api/clipr/text", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate Clipr text.");
  }

  return (await response.json()) as {
    caption: string;
    description: string;
    hashtags: string[];
    hook: string;
    overlayText: string;
    script: string;
    slides: string[];
    socialCaption: string;
  };
}
