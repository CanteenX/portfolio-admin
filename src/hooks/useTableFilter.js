import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";

/**
 * Filters table rows by a debounced search term and exact-match filters.
 *
 * Two call styles are supported because the codebase uses both:
 *
 *   Controlled — the caller owns the state and gets the filtered array back:
 *     const rows = useTableFilter({ data, searchTerm, searchFields, filters })
 *
 *   Self-managed — the hook owns the state and hands back setters:
 *     const { filteredData, searchTerm, setSearchTerm, filters, setFilter } =
 *       useTableFilter(data, { searchFields, exactFilters: { status: "" } })
 *
 * Why both: this hook was refactored to the controlled form, and CRM, Ecommerce
 * and User Management — all written against the self-managed form — were never
 * updated. An array has no `.data`, so they filtered nothing, received
 * `undefined`, and handed it to useTableSort, which destructured it and threw
 * during render. With no error boundary that unmounted the entire admin panel:
 * a white screen, including on the super admin's own user-management page.
 *
 * The style is decided per call site by the second argument, which only the
 * self-managed form passes. Every hook below runs unconditionally in both
 * modes, so the Rules of Hooks hold even though the return shape differs.
 */
export function useTableFilter(arg, selfManagedConfig) {
  const selfManaged = Array.isArray(arg) || selfManagedConfig !== undefined;
  const config = selfManaged ? selfManagedConfig ?? {} : arg ?? {};

  const [ownSearchTerm, setOwnSearchTerm] = useState("");
  const [ownFilters, setOwnFilters] = useState(() => ({ ...(config.exactFilters ?? {}) }));

  const rawData = selfManaged ? arg : config.data;
  const data = Array.isArray(rawData) ? rawData : [];
  const searchTerm = selfManaged ? ownSearchTerm : config.searchTerm ?? "";
  const searchFields = config.searchFields ?? [];

  // Keyed on the joined names: callers pass a fresh array literal every render,
  // which would otherwise defeat the memo below on every keystroke.
  const fieldsKey = searchFields.join("|");

  const ownFilterList = useMemo(
    () => Object.entries(ownFilters).map(([key, value]) => ({ key, value, type: "exact" })),
    [ownFilters]
  );
  const filters = selfManaged ? ownFilterList : config.filters ?? [];

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    const fields = fieldsKey ? fieldsKey.split("|") : [];
    let result = data;

    if (debouncedSearch && fields.length > 0) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((item) =>
        fields.some((field) => {
          const val = item?.[field];
          return val != null && String(val).toLowerCase().includes(term);
        })
      );
    }

    for (const filter of filters) {
      if (!filter.value && filter.value !== 0) continue;

      if (filter.type === "exact") {
        result = result.filter((item) => item?.[filter.key] === filter.value);
      } else if (filter.type === "dateFrom") {
        const from = new Date(filter.value);
        from.setHours(0, 0, 0, 0);
        result = result.filter((item) => new Date(item?.[filter.key]) >= from);
      } else if (filter.type === "dateTo") {
        const to = new Date(filter.value);
        to.setHours(23, 59, 59, 999);
        result = result.filter((item) => new Date(item?.[filter.key]) <= to);
      }
    }

    return result;
  }, [data, debouncedSearch, fieldsKey, filters]);

  const setFilter = useCallback((key, value) => {
    setOwnFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (selfManaged) {
    return {
      filteredData,
      searchTerm: ownSearchTerm,
      setSearchTerm: setOwnSearchTerm,
      filters: ownFilters,
      setFilter
    };
  }
  return filteredData;
}
