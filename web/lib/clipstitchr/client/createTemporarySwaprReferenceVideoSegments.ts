import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createVideoSegmentBlob } from "@/lib/clipstitchr/media/createVideoSegmentBlob";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createSwaprSegmentTrimRanges } from "@/lib/clipstitchr/utils/createSwaprSegmentTrimRanges";

type CreateTemporarySwaprReferenceVideoSegmentsOptions = {
  clip: VideoClipMetadata;
  segmentDurationLimit: number;
  sourceClip: VideoClip;
};

export async function createTemporarySwaprReferenceVideoSegments({
  clip,
  segmentDurationLimit,
  sourceClip,
}: CreateTemporarySwaprReferenceVideoSegmentsOptions): Promise<
  SwaprReferenceVideoSegment[]
> {
  const ranges = createSwaprSegmentTrimRanges(
    sourceClip.duration,
    segmentDurationLimit,
  );
  const segments: SwaprReferenceVideoSegment[] = [];

  try {
    for (let index = 0; index < ranges.length; index += 1) {
      const segment = await createVideoSegmentBlob(sourceClip, {
        trimRange: ranges[index],
      });
      const [videoObject] = await uploadBlobsToR2([
        {
          blob: segment.blob,
          kind: "swapr-segment-video",
          recordId: `${clip.id}-${createId()}`,
        },
      ]);

      segments.push({
        duration: ranges[index].end - ranges[index].start,
        isTemporary: true,
        videoObject,
      });
    }
  } catch (error) {
    await deleteObjectsFromR2(
      segments.map((segment) => segment.videoObject),
    ).catch(() => null);

    throw error;
  }

  return segments;
}
