import { blogImageStoragePrefix } from "./blogImageStoragePrefix";

const safeBlogImagePathSegmentPattern = /^[a-zA-Z0-9._-]+$/;

export function getBlogImageR2KeyFromRoutePath(path: string[]) {
  if (!path.length) {
    throw new Error("Missing blog image path.");
  }

  for (const segment of path) {
    if (
      !segment ||
      segment === "." ||
      segment === ".." ||
      !safeBlogImagePathSegmentPattern.test(segment)
    ) {
      throw new Error("Invalid blog image path.");
    }
  }

  return `${blogImageStoragePrefix}/${path.join("/")}`;
}
