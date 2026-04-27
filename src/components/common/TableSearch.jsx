import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, X } from "lucide-react";

export function TableSearch({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  totalItems,
  filteredItems,
  filters = [],
  onClear,
}) {
  const hasActiveFilters = searchTerm || filters.some((f) => f.value);

  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 bg-background border-input rounded-sm h-9"
        />
      </div>
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[140px]">
          {filter.type === "select" ? (
            <Select value={filter.value || "all"} onValueChange={(v) => filter.onChange(v === "all" ? "" : v)}>
              <SelectTrigger className="bg-background border-input rounded-sm h-9 text-xs">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-sm">
                <SelectItem value="all">{filter.allLabel || "All"}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : filter.type === "date" ? (
            <Input
              type="date"
              value={filter.value || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-background border-input rounded-sm font-mono text-xs h-9"
            />
          ) : null}
        </div>
      ))}
      {hasActiveFilters && onClear && (
        <Button variant="outline" onClick={onClear} className="rounded-sm text-xs font-bold uppercase h-9">
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      )}
      {totalItems !== undefined && (
        <span className="text-xs text-muted-foreground ml-2">
          Showing {filteredItems ?? totalItems} of {totalItems}
        </span>
      )}
    </div>
  );
}
