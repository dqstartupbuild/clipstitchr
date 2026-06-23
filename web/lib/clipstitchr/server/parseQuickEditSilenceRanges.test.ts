import { describe, expect, it } from "vitest";
import { parseQuickEditSilenceRanges } from "@/lib/clipstitchr/server/parseQuickEditSilenceRanges";

describe("parseQuickEditSilenceRanges", () => {
  it("parses ffmpeg silencedetect stderr ranges", () => {
    expect(
      parseQuickEditSilenceRanges([
        "[silencedetect @ 0x1] silence_start: 2.4",
        "[silencedetect @ 0x1] silence_end: 5.1 | silence_duration: 2.7",
      ].join("\n")),
    ).toEqual([
      {
        duration: 2.7,
        end: 5.1,
        start: 2.4,
      },
    ]);
  });
});
