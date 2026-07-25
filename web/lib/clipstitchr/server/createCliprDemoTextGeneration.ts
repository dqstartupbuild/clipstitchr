import { createCliprDemoVisualPrompt } from "@/lib/clipstitchr/server/createCliprDemoVisualPrompt";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateCliprDemoTextGenerationOptions = {
  demoClipId: string;
  demoClipName: string;
  demoVideoDescription?: string;
  durationSeconds: number;
  product: ProductProfile;
};

export function createCliprDemoTextGeneration({
  demoClipId,
  demoClipName,
  demoVideoDescription,
  durationSeconds,
  product,
}: CreateCliprDemoTextGenerationOptions): CliprTextGeneration {
  const visualPrompt = createCliprDemoVisualPrompt({
    demoClipName,
    demoVideoDescription,
    product,
  });
  const script = `Silent demo remix using ${demoClipName}.`;

  return {
    caption: "",
    description: "",
    filledHook: "Demo remix",
    hashtags: [],
    hookOptions: [],
    hookStyleKey: "demo_remix_source",
    hookTemplateId: "DEMO-001",
    overlayText: "Demo remix",
    providerModel: "clipstitchr-local-demo-plan",
    scenePlan: [
      {
        id: createId(),
        index: 0,
        sceneType: "demo",
        scriptText: script,
        visualPrompt,
        estimatedDurationSeconds: durationSeconds,
      },
    ],
    script,
    slides: ["Demo remix"],
    socialCaption: "",
    variablesUsed: {
      demoClipId,
    },
  };
}
