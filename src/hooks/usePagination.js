import { useState, useMemo } from "react";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Client-side pagination over an in-memory list.
 *
 * Accepts either `usePagination({ data, initialPageSize })` or the positional
 * `usePagination(rows, pageSize)` that CRM, Ecommerce and User Management use.
 * Under the options-only signature those pages passed an array as the options
 * object; an array has no `.data`, so they paginated an empty list and every
 * table rendered blank even when rows had loaded.
 */
export function usePagination(arg, positionalPageSize) {
  const options = Array.isArray(arg)
    ? { data: arg, initialPageSize: positionalPageSize }
    : arg ?? {};
  const data = Array.isArray(options.data) ? options.data : [];
  const initialPageSize = options.initialPageSize ?? DEFAULT_PAGE_SIZE;

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
    PAGE_SIZE_OPTIONS
  };
}
