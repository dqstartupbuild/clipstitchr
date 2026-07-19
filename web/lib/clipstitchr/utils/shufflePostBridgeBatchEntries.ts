import type { PostBridgeBatchEntry } from "@/lib/clipstitchr/types/PostBridgeBatchEntry";

export function shufflePostBridgeBatchEntries(
  entries: PostBridgeBatchEntry[],
  getRandomValue: () => number = Math.random,
) {
  const shuffledEntries = [...entries];

  for (let index = shuffledEntries.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(getRandomValue() * (index + 1));
    [shuffledEntries[index], shuffledEntries[randomIndex]] = [
      shuffledEntries[randomIndex],
      shuffledEntries[index],
    ];
  }

  if (
    shuffledEntries.length > 1 &&
    shuffledEntries.every((entry, index) => entry === entries[index])
  ) {
    shuffledEntries.push(shuffledEntries.shift()!);
  }

  return shuffledEntries;
}
