export function getUploadAnalysisOutputText(output: unknown) {
  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    return output
      .map((item) => (typeof item === "string" ? item : ""))
      .join("");
  }

  return "";
}
