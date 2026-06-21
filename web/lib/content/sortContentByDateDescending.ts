type DatedContent = {
  date: string;
  updated?: string;
};

export function sortContentByDateDescending<T extends DatedContent>(
  documents: T[],
) {
  return [...documents].sort((left, right) => {
    return (
      new Date(right.updated ?? right.date).getTime() -
      new Date(left.updated ?? left.date).getTime()
    );
  });
}
