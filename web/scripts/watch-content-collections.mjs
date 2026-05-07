import path from "node:path";
import { createBuilder } from "@content-collections/core";

const configurationPath = path.resolve(process.cwd(), "content-collections.ts");
const builder = await createBuilder(configurationPath);

// Initial build, then watch for changes (file renames, additions, deletions)
await builder.build();
const watcher = await builder.watch();

process.on("SIGINT", async () => {
  await watcher.unsubscribe();
  process.exit(0);
});
