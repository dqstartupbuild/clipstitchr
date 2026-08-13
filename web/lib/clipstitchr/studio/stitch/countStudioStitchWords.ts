export function countStudioStitchWords(text: string): number {
  const words = text.trim().match(/\S+/g);
  return words?.length ?? 0;
}
