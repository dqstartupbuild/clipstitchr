import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { getOrderedStitchSequenceSegments } from "@/lib/clipstitchr/utils/getOrderedStitchSequenceSegments";
import { getStitchSegmentAudioLabel } from "@/lib/clipstitchr/utils/getStitchSegmentAudioLabel";
import { getStitchHasSequenceSegments } from "@/lib/clipstitchr/utils/getStitchHasSequenceSegments";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";

export type StitchDetailItem = {
  isCopyable?: boolean;
  label: string;
  value?: string;
};

export function getStitchDetailItems(stitch: Stitch): StitchDetailItem[] {
  if (getStitchHasSequenceSegments(stitch)) {
    const segments = getOrderedStitchSequenceSegments(stitch.sequenceSegments);
    const isStandalone = segments.length === 1;

    return segments.flatMap((segment, index) => {
      const sourceLabel = isStandalone ? "Source" : `Source ${index + 1}`;

      return [
        { label: `${sourceLabel} video`, value: segment.clipName },
        {
          label: `${sourceLabel} trim`,
          value: getStitchTrimRangeLabel(segment.trimRange),
        },
        {
          label: `${sourceLabel} audio`,
          value: getStitchSegmentAudioLabel(segment.clipType, stitch),
        },
        {
          label: `${sourceLabel} speed`,
          value: `${segment.playbackRate ?? 1}x`,
        },
      ];
    });
  }

  return [
    { label: "Hook/UGC clip", value: stitch.ugcClipName },
    { label: "Demo clip", value: stitch.demoClipName },
    { label: "Hook/UGC trim", value: getStitchTrimRangeLabel(stitch.ugcTrimRange) },
    { label: "Demo trim", value: getStitchTrimRangeLabel(stitch.demoTrimRange) },
    {
      label: "Hook/UGC audio",
      value: stitch.includeUgcAudio === false ? "Muted" : "Included",
    },
    {
      label: "Demo audio",
      value: stitch.includeDemoAudio === false ? "Muted" : "Included",
    },
    { label: "Hook/UGC speed", value: `${stitch.ugcPlaybackRate ?? 1}x` },
    { label: "Demo speed", value: `${stitch.demoPlaybackRate ?? 1}x` },
  ];
}
