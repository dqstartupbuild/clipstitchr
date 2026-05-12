import type { SwiprBackgroundSeedStyle } from "@/lib/clipstitchr/types/SwiprBackgroundSeedStyle";

export const swiprBackgroundSeedStyles = [
  {
    id: "realistic-ugc",
    label: "Realistic UGC",
    presetId: "countertop",
    tags: ["ugc", "realistic", "natural", "phone-camera"],
    promptDirection:
      "natural phone-camera realism, believable everyday texture, lightly imperfect but clean",
    lighting: "soft available light with practical shadows",
    palette: "true-to-life neutrals with one restrained accent color",
    composition: "eye-level portrait framing with open middle and upper thirds",
  },
  {
    id: "clean-studio",
    label: "Clean Studio",
    presetId: "studio",
    tags: ["studio", "clean", "commercial", "polished"],
    promptDirection:
      "clean commercial studio photography with crisp surfaces and controlled detail",
    lighting: "softbox lighting with even gradients and gentle shadow falloff",
    palette: "white, light gray, and one product-category accent",
    composition: "center-weighted vertical layout with clear negative space",
  },
  {
    id: "premium-editorial",
    label: "Premium Editorial",
    presetId: "editorial",
    tags: ["editorial", "premium", "luxury", "magazine"],
    promptDirection:
      "premium editorial still-life mood, refined styling, layered depth, and tasteful contrast",
    lighting: "directional side light with soft highlights and dimensional shadows",
    palette: "rich neutrals with deep accent tones",
    composition: "asymmetric edge detail with strong open space for later design",
  },
  {
    id: "minimal-negative-space",
    label: "Minimal Negative Space",
    presetId: "minimal",
    tags: ["minimal", "negative-space", "simple", "clean"],
    promptDirection:
      "minimal background design with sparse props, quiet surfaces, and no clutter",
    lighting: "diffuse daylight with low contrast",
    palette: "soft neutral tones with subtle material variation",
    composition: "large uninterrupted center and upper area with detail kept low or to one edge",
  },
  {
    id: "warm-lifestyle",
    label: "Warm Lifestyle",
    presetId: "countertop",
    tags: ["lifestyle", "warm", "home", "approachable"],
    promptDirection:
      "warm lifestyle photography, approachable environment, natural domestic or service setting",
    lighting: "golden natural light with cozy practical highlights",
    palette: "warm neutrals, wood tones, and soft muted accents",
    composition: "real-world portrait scene with balanced lower-third detail",
  },
  {
    id: "bold-color-pop",
    label: "Bold Color Pop",
    presetId: "editorial",
    tags: ["colorful", "bold", "social", "high-contrast"],
    promptDirection:
      "bold color-blocked commercial styling with energetic contrast and crisp shapes",
    lighting: "bright studio light with vivid but realistic color",
    palette: "two strong accent colors balanced by a clean neutral base",
    composition: "graphic vertical layout with clear focal zones and uncluttered center",
  },
  {
    id: "textured-surface",
    label: "Textured Surface",
    presetId: "countertop",
    tags: ["texture", "surface", "material", "tactile"],
    promptDirection:
      "material-focused still life with tactile surfaces and subtle prop edges",
    lighting: "raking side light that reveals texture without harsh glare",
    palette: "stone, wood, fabric, tile, or matte painted tones suited to the niche",
    composition: "surface-forward vertical crop with usable empty space above",
  },
  {
    id: "natural-daylight",
    label: "Natural Daylight",
    presetId: "outdoor",
    tags: ["daylight", "outdoor", "fresh", "bright"],
    promptDirection:
      "fresh natural daylight photography with believable environment depth",
    lighting: "open shade or clean morning daylight",
    palette: "fresh environmental colors with natural contrast",
    composition: "wide portrait scene with detail around the edges and a clean central field",
  },
] satisfies readonly SwiprBackgroundSeedStyle[];
