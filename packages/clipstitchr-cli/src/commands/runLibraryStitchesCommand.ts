import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { parsePositiveIntegerOption } from "./parsePositiveIntegerOption.js";
import { listLibraryStitches } from "../api/listLibraryStitches.js";
import { logInfo } from "../terminal/logInfo.js";

type LibraryStitchesCommandOptions = CliGlobalOptions & {
  limit?: string;
  product?: string;
  ready?: boolean;
};

function getStitchStatusLabel(stitch: {
  hasRenderedVideo: boolean;
  isPosted?: boolean;
}) {
  if (stitch.isPosted) {
    return "posted";
  }

  return stitch.hasRenderedVideo ? "ready" : "rendering";
}

export async function runLibraryStitchesCommand(
  options: LibraryStitchesCommandOptions,
) {
  const credentials = await getCommandCredentials(options);
  const { stitches } = await listLibraryStitches(credentials, {
    limit: parsePositiveIntegerOption(options.limit),
    productId: options.product,
    readyOnly: options.ready,
  });

  if (!stitches.length) {
    logInfo("No Stitches found.");
    return;
  }

  for (const stitch of stitches) {
    console.log(
      `${stitch.id}\t${getStitchStatusLabel(stitch)}\t${stitch.name}`,
    );
  }
}
