import type { QueueContentItem } from "./QueueContentItem.js";

export function shuffleQueueContentItems(
  items: QueueContentItem[],
  random = Math.random,
) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const item = shuffled[index];

    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = item;
  }

  return shuffled;
}
