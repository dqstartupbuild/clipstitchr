import { parseQuickEditSilenceRanges } from "@/lib/clipstitchr/server/parseQuickEditSilenceRanges";
import { runQuickEditDetectorFfmpeg } from "@/lib/clipstitchr/server/runQuickEditDetectorFfmpeg";

export async function extractQuickEditSilenceRanges(input: string) {
  const { stderr } = await runQuickEditDetectorFfmpeg({
    args: [
      "-hide_banner",
      "-i",
      input,
      "-af",
      "silencedetect=noise=-35dB:d=1.2",
      "-f",
      "null",
      "-",
    ],
    maxStdoutBytes: 256_000,
  });

  return parseQuickEditSilenceRanges(stderr);
}
