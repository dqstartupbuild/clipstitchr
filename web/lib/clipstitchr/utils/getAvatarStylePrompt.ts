import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export function getAvatarStylePrompt(style: AvatarStyleOption) {
  switch (style) {
    case "ugc":
      return "authentic creator-style UGC source photo, casual phone-shot framing, natural everyday lighting, unpolished realism, not a studio portrait";
    case "photo":
      return "polished realistic portrait photo style";
    case "candid":
      return "candid everyday photo style";
    case "editorial":
      return "clean editorial lifestyle photo style";
    case "travel":
      return "travel photo style with real-world context";
    case "cinematic":
      return "cinematic realistic photo style";
    case "selfie":
    default:
      return "casual realistic selfie style";
  }
}
