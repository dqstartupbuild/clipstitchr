import path from "node:path";
import { createBuilder } from "@content-collections/core";

const configurationPath = path.resolve(process.cwd(), "content-collections.ts");
const builder = await createBuilder(configurationPath);

await builder.build();
