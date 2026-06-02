import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export function getAvatarStylePrompt(style: AvatarStyleOption) {
  switch (style) {
    case "ugc":
      return "authentic creator-style UGC reaction source photo, tight vertical front-camera phone selfie framing, arm's-length talking-head crop, face and shoulders close to camera, natural everyday lighting, unpolished realism, not a studio portrait";
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
