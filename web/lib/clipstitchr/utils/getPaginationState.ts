type GetPaginationStateOptions = {
  currentPage: number;
  itemCount: number;
  pageSize: number;
};

export function getPaginationState({
  currentPage,
  itemCount,
  pageSize,
}: GetPaginationStateOptions) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(itemCount / safePageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = itemCount > 0 ? (page - 1) * safePageSize : 0;
  const endIndex = Math.min(startIndex + safePageSize, itemCount);

  return {
    canGoNext: page < totalPages,
    canGoPrevious: page > 1,
    currentPage: page,
    endIndex,
    totalPages,
    visibleEnd: endIndex,
    visibleStart: itemCount > 0 ? startIndex + 1 : 0,
    startIndex,
  };
}
