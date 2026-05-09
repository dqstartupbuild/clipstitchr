import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";

export function getAvatarLightingPrompt(lighting: AvatarLightingOption) {
  switch (lighting) {
    case "any":
      return "any realistic lighting that fits each situation";
    case "studio":
      return "clean studio lighting";
    case "golden-hour":
      return "warm golden-hour sunlight";
    case "night":
      return "realistic low-light night photography";
    case "dramatic":
      return "dramatic directional lighting";
    case "natural":
      return "natural realistic lighting";
    default:
      return "any realistic lighting that fits each situation";
  }
}
