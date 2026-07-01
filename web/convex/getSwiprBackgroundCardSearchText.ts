type SwiprBackgroundCardSearchTextSource = {
  description?: string;
  details?: string;
  libraryQuery?: string;
  name: string;
  tags?: string[];
};

export function getSwiprBackgroundCardSearchText(
  background: SwiprBackgroundCardSearchTextSource,
) {
  return [
    background.name,
    background.description,
    background.details,
    background.libraryQuery,
    ...(background.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
