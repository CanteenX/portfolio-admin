import { useState, useMemo } from "react";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function usePagination({ data = [], initialPageSize = DEFAULT_PAGE_SIZE }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (safePage - 1) * pageSize;

  const paginatedData = useMemo(
    () => data.slice(startIndex, startIndex + pageSize),
    [data, startIndex, pageSize]
  );

  const setPageSize = (newSize) => {
    setPageSizeState(newSize);
    setCurrentPage(1);
  };

  return {
    paginatedData,
    currentPage: safePage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    startIndex,
    PAGE_SIZE_OPTIONS,
  };
}
