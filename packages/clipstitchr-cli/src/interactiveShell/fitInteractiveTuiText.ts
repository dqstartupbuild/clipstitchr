export function fitInteractiveTuiText(input: {
  text: string;
  width: number;
}) {
  if (input.text.length <= input.width) {
    return input.text.padEnd(input.width, " ");
  }

  if (input.width <= 3) {
    return ".".repeat(input.width);
  }

  return `${input.text.slice(0, input.width - 3)}...`;
}
