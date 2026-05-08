"use client";

import { useCallback, useMemo, useState } from "react";
import { getPaginationState } from "@/lib/clipstitchr/utils/getPaginationState";

type UsePaginationOptions = {
  pageSize: number;
};

export function usePagination<T>(items: T[], { pageSize }: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(1);
  const pagination = useMemo(
    () =>
      getPaginationState({
        currentPage,
        itemCount: items.length,
        pageSize,
      }),
    [currentPage, items.length, pageSize],
  );
  const pageItems = useMemo(
    () => items.slice(pagination.startIndex, pagination.endIndex),
    [items, pagination.endIndex, pagination.startIndex],
  );
  const goToNextPage = useCallback(() => {
    setCurrentPage(
      getPaginationState({
        currentPage: pagination.currentPage + 1,
        itemCount: items.length,
        pageSize,
      }).currentPage,
    );
  }, [items.length, pageSize, pagination.currentPage]);
  const goToPreviousPage = useCallback(() => {
    setCurrentPage(
      getPaginationState({
        currentPage: pagination.currentPage - 1,
        itemCount: items.length,
        pageSize,
      }).currentPage,
    );
  }, [items.length, pageSize, pagination.currentPage]);

  return {
    ...pagination,
    goToNextPage,
    goToPreviousPage,
    pageItems,
    totalItems: items.length,
  };
}
