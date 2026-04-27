import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export function SortableHeader({ label, sortKey, currentSortKey, sortDirection, onSort }) {
  const isActive = currentSortKey === sortKey;

  return (
    <th
      className="cursor-pointer select-none uppercase tracking-wider text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
        )}
      </div>
    </th>
  );
}
