export function createCliprSeedanceNativeAudioPrompt(prompt: string) {
  return prompt
    .split("\n")
    .filter((line) => !line.includes("[Audio1]"))
    .map((line) =>
      line.startsWith("Spoken dialogue:")
        ? line.replace("Spoken dialogue:", "The creator says:")
        : line,
    )
    .join("\n");
}
