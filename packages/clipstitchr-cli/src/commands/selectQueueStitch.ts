import { select } from "@inquirer/prompts";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { LibraryStitchSummary } from "../library/LibraryStitchSummary.js";
import { listLibraryStitches } from "../api/listLibraryStitches.js";

export async function selectQueueStitch(
  credentials: ClipstitchrCredentials,
): Promise<LibraryStitchSummary> {
  const { stitches } = await listLibraryStitches(credentials, {
    limit: 20,
    readyOnly: true,
  });
  const availableStitches = stitches.filter((stitch) => !stitch.isPosted);

  if (!availableStitches.length) {
    throw new Error("No ready Stitches found. Run `clipstitchr library stitches`.");
  }

  if (availableStitches.length === 1) {
    return availableStitches[0];
  }

  const selectedId = await select({
    choices: availableStitches.map((stitch) => ({
      name: stitch.name,
      value: stitch.id,
    })),
    message: "Which finished Stitch should I add to your queue?",
  });

  return (
    availableStitches.find((stitch) => stitch.id === selectedId) ??
    availableStitches[0]
  );
}
