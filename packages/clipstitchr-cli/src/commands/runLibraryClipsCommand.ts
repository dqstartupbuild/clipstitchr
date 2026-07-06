import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { parsePositiveIntegerOption } from "./parsePositiveIntegerOption.js";
import { listLibraryClips } from "../api/listLibraryClips.js";
import type { ClipLibraryKind } from "../library/ClipLibraryKind.js";
import { logInfo } from "../terminal/logInfo.js";

type LibraryClipsCommandOptions = CliGlobalOptions & {
  kind?: ClipLibraryKind;
  limit?: string;
  product?: string;
};

export async function runLibraryClipsCommand(
  options: LibraryClipsCommandOptions,
) {
  const credentials = await getCommandCredentials(options);
  const { clips } = await listLibraryClips(credentials, {
    kind: options.kind,
    limit: parsePositiveIntegerOption(options.limit),
    productId: options.product,
  });

  if (!clips.length) {
    logInfo("No clips found.");
    return;
  }

  for (const clip of clips) {
    console.log(`${clip.id}\t${clip.kind}\t${clip.name}`);
  }
}
