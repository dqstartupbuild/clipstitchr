import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";
import { getQuickEditDetectorFrameStats } from "@/lib/clipstitchr/server/getQuickEditDetectorFrameStats";
import { quickEditDetectorFrameSize } from "@/lib/clipstitchr/server/quickEditDetectorFrameSize";
import { runQuickEditDetectorFfmpeg } from "@/lib/clipstitchr/server/runQuickEditDetectorFfmpeg";

export async function extractQuickEditDetectorFrameSamples(input: string) {
  const frameBytes = quickEditDetectorFrameSize * quickEditDetectorFrameSize;
  const { stdout } = await runQuickEditDetectorFfmpeg({
    args: [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      input,
      "-an",
      "-vf",
      `fps=1,scale=${quickEditDetectorFrameSize}:${quickEditDetectorFrameSize},format=gray`,
      "-f",
      "rawvideo",
      "pipe:1",
    ],
    maxStdoutBytes: frameBytes * 900,
  });
  const samples: QuickEditDetectorFrameSample[] = [];

  for (let offset = 0; offset + frameBytes <= stdout.length; offset += frameBytes) {
    const pixels = Uint8Array.from(stdout.subarray(offset, offset + frameBytes));
    const stats = getQuickEditDetectorFrameStats(pixels);

    samples.push({
      ...stats,
      pixels,
      time: samples.length,
    });
  }

  return samples;
}
