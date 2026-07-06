export async function fetchLatestCliVersion() {
  const response = await fetch("https://registry.npmjs.org/clipstitchr/latest");

  if (!response.ok) {
    throw new Error("Could not check npm for the latest ClipStitchr version.");
  }

  const body = (await response.json()) as { version?: string };

  if (!body.version) {
    throw new Error("npm did not return a ClipStitchr version.");
  }

  return body.version;
}
