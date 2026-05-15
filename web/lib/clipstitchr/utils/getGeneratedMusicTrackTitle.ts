import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";

type GetGeneratedMusicTrackTitleOptions = {
  source: MusicTrackSource;
  trackId: string;
  style?: string;
};

const moods = [
  "Bright",
  "Warm",
  "Clean",
  "Focused",
  "Soft",
  "Bold",
  "Calm",
  "Fresh",
  "Clear",
  "Lifted",
];

const textures = [
  "Creator",
  "Studio",
  "Modern",
  "Kinetic",
  "Ambient",
  "Polished",
  "Social",
  "Light",
  "Smooth",
  "Electric",
];

const forms = [
  "Pulse",
  "Bed",
  "Groove",
  "Drift",
  "Rhythm",
  "Loop",
  "Flow",
  "Motion",
];

function getSeedHash(seed: string) {
  return Array.from(seed).reduce(
    (hash, character) =>
      (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0,
    0,
  );
}

export function getGeneratedMusicTrackTitle({
  source,
  trackId,
  style,
}: GetGeneratedMusicTrackTitleOptions) {
  const hash = getSeedHash([source, style, trackId].filter(Boolean).join("|"));
  const mood = moods[hash % moods.length];
  const texture = textures[Math.floor(hash / moods.length) % textures.length];
  const form =
    forms[Math.floor(hash / (moods.length * textures.length)) % forms.length];

  return `${mood} ${texture} ${form}`;
}
