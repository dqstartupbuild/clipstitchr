import {
  CLIPR_MUSIC_STANDALONE_GAIN,
  CLIPR_MUSIC_UNDERLAY_GAIN,
} from "@/lib/clipstitchr/constants/cliprMusicMix";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

type GetCliprMusicGainOptions = {
  hasSourceAudio: boolean;
  volume: number;
};

export function getCliprMusicGain({
  hasSourceAudio,
  volume,
}: GetCliprMusicGainOptions) {
  const baseGain = hasSourceAudio
    ? CLIPR_MUSIC_UNDERLAY_GAIN
    : CLIPR_MUSIC_STANDALONE_GAIN;

  return baseGain * clamp(volume, 0, 1);
}
