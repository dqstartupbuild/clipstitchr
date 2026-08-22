export function appendVaryHeader(headers: Headers, value: string) {
  const existingValues = (headers.get("Vary") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const existingLowercaseValues = new Set(
    existingValues.map((entry) => entry.toLowerCase()),
  );

  for (const entry of value.split(",").map((item) => item.trim())) {
    if (entry && !existingLowercaseValues.has(entry.toLowerCase())) {
      existingValues.push(entry);
      existingLowercaseValues.add(entry.toLowerCase());
    }
  }

  headers.set("Vary", existingValues.join(", "));
}
