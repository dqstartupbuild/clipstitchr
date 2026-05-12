import { swiprBackgroundSeedNiches } from "@/lib/clipstitchr/constants/swiprBackgroundSeedNiches";
import { swiprBackgroundSeedStyles } from "@/lib/clipstitchr/constants/swiprBackgroundSeedStyles";
import type { SwiprBackgroundSeedNiche } from "@/lib/clipstitchr/types/SwiprBackgroundSeedNiche";
import type { SwiprBackgroundSeedPlan } from "@/lib/clipstitchr/types/SwiprBackgroundSeedPlan";
import type { SwiprBackgroundSeedStyle } from "@/lib/clipstitchr/types/SwiprBackgroundSeedStyle";

function normalizeSeedTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSeedTags({
  niche,
  settingIndex,
  style,
}: {
  niche: SwiprBackgroundSeedNiche;
  settingIndex: number;
  style: SwiprBackgroundSeedStyle;
}) {
  const tags = [
    "seed",
    "background",
    "copy space",
    niche.category,
    niche.id,
    ...niche.tags,
    style.id,
    style.presetId,
    ...style.tags,
    `scene ${settingIndex + 1}`,
  ];

  return Array.from(
    new Set(tags.map(normalizeSeedTag).filter((tag) => tag.length > 0)),
  );
}

function createSeedPrompt({
  niche,
  setting,
  style,
}: {
  niche: SwiprBackgroundSeedNiche;
  setting: string;
  style: SwiprBackgroundSeedStyle;
}) {
  return [
    "Create one realistic vertical 9:16 portrait photography backdrop.",
    `Niche: ${niche.label}.`,
    `Scene: ${setting}.`,
    `Visual style: ${style.promptDirection}.`,
    `Lighting: ${style.lighting}.`,
    `Palette: ${style.palette}.`,
    `Composition: ${style.composition}.`,
    "Keep the center and upper third open for later compositing.",
    "Use believable materials, natural depth, and a finished commercial photo look.",
    "Do not include visible words, letters, numbers, logos, labels, watermarks, screens, UI, people, hands, product packaging, or brand marks.",
  ].join(" ");
}

function createSeedDescription({
  niche,
  setting,
  style,
}: {
  niche: SwiprBackgroundSeedNiche;
  setting: string;
  style: SwiprBackgroundSeedStyle;
}) {
  return `${style.label} ${niche.label.toLowerCase()} background in ${setting}. Built for ${niche.productFit}.`;
}

function createSeedDetails({
  niche,
  prompt,
  setting,
  settingId,
  style,
  tags,
}: {
  niche: SwiprBackgroundSeedNiche;
  prompt: string;
  setting: string;
  settingId: string;
  style: SwiprBackgroundSeedStyle;
  tags: string[];
}) {
  return [
    "Seed metadata: prefilled; no AI image analysis required.",
    `Category: ${niche.category}.`,
    `Niche: ${niche.label} (${niche.id}).`,
    `Style: ${style.label} (${style.id}).`,
    `Preset: ${style.presetId}.`,
    `Scene: ${settingId}; ${setting}.`,
    `Product fit: ${niche.productFit}.`,
    `Visual details: ${style.promptDirection}; ${style.lighting}; ${style.palette}; ${style.composition}.`,
    "Copy space: center and upper third intentionally open for Swipr slide text and product content.",
    `Search tags: ${tags.join(", ")}.`,
    `Generation prompt: ${prompt}`,
  ].join("\n");
}

export function createSwiprBackgroundSeedPlans(): SwiprBackgroundSeedPlan[] {
  return swiprBackgroundSeedNiches.flatMap((niche) =>
    niche.settings.flatMap((setting, settingIndex) => {
      const settingId = `scene-${String(settingIndex + 1).padStart(2, "0")}`;

      return swiprBackgroundSeedStyles.map((style) => {
        const id = `swipr-seed-${niche.id}-${style.id}-${settingId}`;
        const tags = createSeedTags({ niche, settingIndex, style });
        const prompt = createSeedPrompt({ niche, setting, style });
        const description = createSeedDescription({ niche, setting, style });

        return {
          id,
          name: `${style.label} ${niche.label} ${settingIndex + 1}`,
          tags,
          description,
          details: createSeedDetails({
            niche,
            prompt,
            setting,
            settingId,
            style,
            tags,
          }),
          prompt,
          source: "seed",
          presetId: style.presetId,
          category: niche.category,
          nicheId: niche.id,
          nicheLabel: niche.label,
          styleId: style.id,
          styleLabel: style.label,
          settingId,
          setting,
        };
      });
    }),
  );
}
