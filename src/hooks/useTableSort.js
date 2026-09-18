import { useState, useMemo } from "react";

/**
 * Sorts table rows by a toggleable key.
 *
 * Accepts either `useTableSort({ data, initialSortKey, initialDirection })` or
 * the bare rows `useTableSort(rows)`. Returns the toggle under both
 * `toggleSort` and `handleSort`.
 *
 * Why: CRM, Ecommerce and User Management call this with the rows directly and
 * read `handleSort`. The options-object signature destructured `undefined` the
 * moment a caller passed nothing, which threw during render and white-screened
 * the whole admin; and `handleSort` did not exist, so every sortable column
 * header would have thrown on click. Defaulting the argument means a future
 * mistake renders an empty table instead of taking the panel down.
 */
export function useTableSort(arg) {
  const options = Array.isArray(arg) ? { data: arg } : arg ?? {};
  const { initialSortKey = "", initialDirection = "asc" } = options;
  const data = Array.isArray(options.data) ? options.data : [];

  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a?.[sortKey];
      const bVal = b?.[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return { sortedData, sortKey, sortDirection, toggleSort, handleSort: toggleSort };
}
