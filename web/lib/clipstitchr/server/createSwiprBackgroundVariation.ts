import { getSwiprBackgroundGenerationCategory } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationCategory";
import type { SwiprBackgroundGenerationCategory } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationCategory";
import type { SwiprBackgroundGenerationVariation } from "@/lib/clipstitchr/types/SwiprBackgroundGenerationVariation";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

type SwiprBackgroundVariationPack = {
  cameraAngles: string[];
  compositions: string[];
  lighting: string[];
  palettes: string[];
  presetIds: SwiprBackgroundPresetId[];
  scenes: string[];
  surfaces: string[];
};

type CreateSwiprBackgroundVariationOptions = {
  preferredPresetId?: SwiprBackgroundPresetId;
  productContext: string;
  random?: () => number;
};

const variationPacks: Record<
  SwiprBackgroundGenerationCategory,
  SwiprBackgroundVariationPack
> = {
  food: {
    presetIds: ["countertop", "editorial", "outdoor", "studio"],
    scenes: [
      "empty neighborhood restaurant counter with warm ambient depth",
      "sunlit patio table setting with room for a hero object",
      "clean prep surface near a soft oven glow",
      "casual takeout pickup counter with realistic lifestyle texture",
    ],
    lighting: [
      "warm evening restaurant light",
      "bright morning window light",
      "soft overhead kitchen light",
      "golden hour side light",
    ],
    cameraAngles: [
      "low tabletop angle",
      "slight top-down angle",
      "straight-on counter-level view",
      "close foreground depth with a clean center",
    ],
    surfaces: [
      "warm wood counter",
      "matte stone prep surface",
      "clean tile and stainless steel",
      "neutral paper and ceramic textures",
    ],
    palettes: [
      "tomato red, cream, charcoal, and warm wood",
      "olive green, soft white, amber, and stone gray",
      "deep red, black, parchment, and brushed steel",
      "sunlit beige, basil green, terracotta, and off-white",
    ],
    compositions: [
      "large open space across the upper center",
      "subtle depth with visual detail pushed to the lower corners",
      "clean middle third with soft background texture",
      "single realistic scene with no featured product packaging",
    ],
  },
  fitness: {
    presetIds: ["outdoor", "minimal", "editorial", "studio"],
    scenes: [
      "empty outdoor calisthenics park with training bars near the edge",
      "clean gym mat area with a simple strength-training backdrop",
      "sunlit concrete training space with open air behind it",
      "minimal athletic studio with sparse equipment outside the center",
    ],
    lighting: [
      "crisp morning daylight",
      "soft gym overhead light",
      "golden hour outdoor side light",
      "clean studio strip light",
    ],
    cameraAngles: [
      "low athletic ground-level angle",
      "straight-on training-space view",
      "wide portrait composition",
      "slight diagonal angle with open center space",
    ],
    surfaces: [
      "rubber gym flooring",
      "smooth concrete",
      "matte black training mat",
      "brushed metal and painted rail textures",
    ],
    palettes: [
      "charcoal, steel, electric blue, and clean white",
      "forest green, concrete gray, black, and daylight blue",
      "warm tan, black, muted green, and off-white",
      "deep navy, graphite, silver, and soft sky blue",
    ],
    compositions: [
      "empty center with equipment framing the sides",
      "open upper half with grounded texture below",
      "clean vertical lane through the middle",
      "background elements kept soft and away from the edges",
    ],
  },
  beauty: {
    presetIds: ["minimal", "editorial", "studio", "countertop"],
    scenes: [
      "soft vanity surface with refined bathroom depth",
      "minimal spa shelf with natural material texture",
      "editorial beauty backdrop with gentle fabric movement",
      "clean studio surface with soft reflective highlights",
    ],
    lighting: [
      "diffused daylight",
      "soft cosmetic studio light",
      "warm bathroom mirror glow",
      "gentle golden hour light",
    ],
    cameraAngles: [
      "straight-on still-life angle",
      "slight top-down vanity angle",
      "close surface-level view",
      "centered editorial portrait framing without a person",
    ],
    surfaces: [
      "matte stone",
      "soft linen fabric",
      "warm ceramic tile",
      "translucent glass and cream plaster",
    ],
    palettes: [
      "cream, blush, warm gray, and muted gold",
      "sage, ivory, clay, and soft white",
      "charcoal, pearl, pale pink, and chrome",
      "lavender, stone, off-white, and gentle amber",
    ],
    compositions: [
      "large clean center with subtle texture",
      "soft visual detail in the lower third",
      "asymmetric edge detail with open middle space",
      "minimal backdrop with no decorative clutter",
    ],
  },
  home: {
    presetIds: ["countertop", "minimal", "studio", "editorial"],
    scenes: [
      "quiet kitchen counter with natural home depth",
      "bright interior shelf with soft domestic texture",
      "minimal living room surface with clean architecture",
      "sunlit home workspace without electronics in the center",
    ],
    lighting: [
      "soft window light",
      "warm interior lamp light",
      "bright overcast daylight",
      "late afternoon home light",
    ],
    cameraAngles: [
      "straight-on interior angle",
      "slight top-down surface angle",
      "wide portrait room detail",
      "low shelf-level view",
    ],
    surfaces: [
      "light wood",
      "painted plaster",
      "matte ceramic",
      "neutral woven fabric",
    ],
    palettes: [
      "warm white, oak, sage, and slate",
      "soft gray, cream, walnut, and muted blue",
      "terracotta, ivory, olive, and stone",
      "black, white, warm wood, and linen",
    ],
    compositions: [
      "clean center with home texture around the frame",
      "subtle depth and open upper third",
      "large plain wall or surface area",
      "minimal domestic detail near the lower edge",
    ],
  },
  software: {
    presetIds: ["minimal", "studio", "editorial", "countertop"],
    scenes: [
      "clean modern desk surface with no visible devices",
      "abstract productivity workspace using paper, light, and shadows",
      "minimal studio backdrop with crisp geometric surfaces",
      "quiet office texture with open center space",
    ],
    lighting: [
      "clean daylight through blinds",
      "soft neutral studio light",
      "cool morning office light",
      "warm late-day desk light",
    ],
    cameraAngles: [
      "straight-on desk-level angle",
      "top-down surface composition",
      "low angle across a clean work surface",
      "centered portrait workspace framing",
    ],
    surfaces: [
      "matte desk surface",
      "paper and shadow texture",
      "painted wall and brushed metal",
      "clean acrylic and neutral fabric",
    ],
    palettes: [
      "white, graphite, cobalt, and pale gray",
      "warm ivory, black, sky blue, and silver",
      "slate, off-white, mint, and chrome",
      "charcoal, light wood, cream, and soft blue",
    ],
    compositions: [
      "open middle area with edge details only",
      "crisp negative space in the upper half",
      "simple geometric depth without screens",
      "uninterrupted center surface",
    ],
  },
  generic: {
    presetIds: ["studio", "minimal", "editorial", "countertop", "outdoor"],
    scenes: [
      "realistic studio surface with subtle lifestyle depth",
      "minimal commercial photography set",
      "sunlit neutral backdrop with natural texture",
      "editorial still-life environment with open center space",
    ],
    lighting: [
      "soft daylight",
      "warm side light",
      "clean studio light",
      "bright overcast light",
    ],
    cameraAngles: [
      "straight-on portrait view",
      "slight top-down angle",
      "low surface-level angle",
      "wide clean vertical composition",
    ],
    surfaces: [
      "matte stone",
      "painted wood",
      "neutral fabric",
      "brushed metal and soft plaster",
    ],
    palettes: [
      "cream, charcoal, slate, and muted blue",
      "warm white, sage, tan, and black",
      "soft gray, ivory, amber, and steel",
      "deep green, stone, off-white, and graphite",
    ],
    compositions: [
      "large open center",
      "subtle texture around the edges",
      "clean upper and middle thirds",
      "single realistic environment with no featured object",
    ],
  },
};

function getRandomItem<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)] as T;
}

export function createSwiprBackgroundVariation({
  preferredPresetId,
  productContext,
  random = Math.random,
}: CreateSwiprBackgroundVariationOptions): SwiprBackgroundGenerationVariation {
  const category = getSwiprBackgroundGenerationCategory(productContext);
  const pack = variationPacks[category];
  const presetId = preferredPresetId ?? getRandomItem(pack.presetIds, random);

  return {
    cameraAngle: getRandomItem(pack.cameraAngles, random),
    category,
    composition: getRandomItem(pack.compositions, random),
    lighting: getRandomItem(pack.lighting, random),
    palette: getRandomItem(pack.palettes, random),
    presetId,
    scene: getRandomItem(pack.scenes, random),
    surface: getRandomItem(pack.surfaces, random),
  };
}
