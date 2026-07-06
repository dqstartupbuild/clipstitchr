import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { getCommandCredentials } from "./getCommandCredentials.js";
import { parsePositiveIntegerOption } from "./parsePositiveIntegerOption.js";
import { listLibrarySwipes } from "../api/listLibrarySwipes.js";
import { logInfo } from "../terminal/logInfo.js";

type LibrarySwipesCommandOptions = CliGlobalOptions & {
  limit?: string;
  product?: string;
};

export async function runLibrarySwipesCommand(
  options: LibrarySwipesCommandOptions,
) {
  const credentials = await getCommandCredentials(options);
  const { swipes } = await listLibrarySwipes(credentials, {
    limit: parsePositiveIntegerOption(options.limit),
    productId: options.product,
  });

  if (!swipes.length) {
    logInfo("No Swipes found.");
    return;
  }

  for (const swipe of swipes) {
    console.log(`${swipe.id}\t${swipe.slideCount} slides\t${swipe.name}`);
  }
}
