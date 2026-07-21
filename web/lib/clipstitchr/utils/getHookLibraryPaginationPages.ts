export function getHookLibraryPaginationPages(
  currentPage: number,
  totalPages: number,
) {
  const pages = new Set(
    [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
      (page) => page >= 1 && page <= totalPages,
    ),
  );
  const sortedPages = Array.from(pages).sort((left, right) => left - right);

  return sortedPages.flatMap<(number | "ellipsis")>((page, index) => {
    const previousPage = sortedPages[index - 1];

    return previousPage && page - previousPage > 1
      ? ["ellipsis", page]
      : [page];
  });
}
