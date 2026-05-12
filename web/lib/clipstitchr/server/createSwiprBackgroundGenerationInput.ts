import { getSwiprBackgroundGenerationModelFamily } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationModelFamily";

type CreateSwiprBackgroundGenerationInputOptions = {
  modelId: string;
  prompt: string;
};

export function createSwiprBackgroundGenerationInput({
  modelId,
  prompt,
}: CreateSwiprBackgroundGenerationInputOptions) {
  const modelFamily = getSwiprBackgroundGenerationModelFamily(modelId);

  if (modelFamily === "pruna-p-image") {
    return {
      prompt,
      aspect_ratio: "9:16",
      prompt_upsampling: false,
    };
  }

  if (modelFamily === "pruna-wan-2.2-image") {
    return {
      prompt,
      juiced: false,
      megapixels: 2,
      aspect_ratio: "9:16",
      output_format: "jpg",
      output_quality: 80,
    };
  }

  return {
    prompt,
    aspect_ratio: "2:3",
    number_of_images: 1,
    output_format: "jpeg",
    quality: "low",
    background: "opaque",
    moderation: "auto",
  };
}
