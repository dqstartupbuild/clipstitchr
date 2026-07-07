import type { CliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerateRequest";
import type { CliDemoGuideGenerationOutput } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerationOutput";
import type { CliDemoWalkthroughGuide } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoWalkthroughGuide";
import { createCliDemoGuideId } from "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuideId";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createCliDemoWalkthroughGuide({
  createdAt,
  output,
  product,
  request,
}: {
  createdAt: string;
  output: CliDemoGuideGenerationOutput;
  product: ProductProfile;
  request: CliDemoGuideGenerateRequest;
}): CliDemoWalkthroughGuide {
  return {
    appType: request.appType,
    createdAt,
    flowName: request.flowName,
    flowPath: request.flowPath,
    goal: output.goal,
    id: createCliDemoGuideId(),
    productId: product.id,
    productName: product.name,
    source: "ai-assisted",
    steps: output.steps.map((step, index) => ({
      id: `step-${index + 1}`,
      label: step.label,
    })),
    title: output.title,
    updatedAt: createdAt,
    version: 1,
  };
}
