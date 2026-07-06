import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { pathExists } from "./pathExists.js";

const routeRoots = ["app", "pages", "src/app", "src/pages"];
const routeFileNames = new Set(["page.tsx", "page.jsx", "index.tsx", "index.jsx"]);

async function walkRoutes(root: string, current: string, routes: string[]) {
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(current, entry.name);

    if (entry.isDirectory()) {
      if (!entry.name.startsWith("_") && !entry.name.startsWith("(")) {
        await walkRoutes(root, entryPath, routes);
      }
      continue;
    }

    if (routeFileNames.has(entry.name)) {
      const routePath = relative(root, current)
        .split("/")
        .filter(Boolean)
        .map((segment) => segment.replace(/\[|\]/g, ""))
        .join("/");

      routes.push(routePath ? `/${routePath}` : "/");
    }
  }
}

export async function collectRoutePaths(cwd = process.cwd()) {
  const routes: string[] = [];

  for (const routeRoot of routeRoots) {
    const absoluteRoot = join(cwd, routeRoot);

    if (await pathExists(absoluteRoot)) {
      await walkRoutes(absoluteRoot, absoluteRoot, routes);
    }
  }

  return Array.from(new Set(routes)).sort();
}
