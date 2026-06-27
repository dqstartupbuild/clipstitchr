const AUTOMATIC_SOUND_STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "before",
  "but",
  "can",
  "for",
  "from",
  "get",
  "has",
  "have",
  "how",
  "into",
  "make",
  "more",
  "now",
  "our",
  "out",
  "post",
  "see",
  "that",
  "the",
  "this",
  "use",
  "with",
  "you",
  "your",
]);

export function getAutomaticSoundSearchTokens(value: string) {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/#[a-z0-9_]+/gi, (match) => ` ${match.slice(1)} `)
        .replace(/[^a-z0-9]+/g, " ")
        .split(" ")
        .map((token) => token.trim())
        .filter(
          (token) =>
            token.length > 2 && !AUTOMATIC_SOUND_STOP_WORDS.has(token),
        ),
    ),
  );
}
