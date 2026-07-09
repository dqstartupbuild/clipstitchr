export function getNextInteractiveTuiSelectionIndex(input: {
  currentIndex: number;
  direction: "down" | "up";
  itemCount: number;
}) {
  if (input.itemCount === 0) {
    return 0;
  }

  const offset = input.direction === "down" ? 1 : -1;

  return (input.currentIndex + offset + input.itemCount) % input.itemCount;
}
