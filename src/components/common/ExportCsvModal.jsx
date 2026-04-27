import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

/**
 * Escapes a value for safe CSV inclusion.
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a CSV Blob from data and selected columns.
 * @param {Array<Record<string, unknown>>} data
 * @param {Array<{key: string, label: string}>} columns
 * @returns {Blob}
 */
function generateCsvBlob(data, columns) {
  const header = columns.map((col) => escapeCsvValue(col.label)).join(",");
  const rows = data.map((row) =>
    columns.map((col) => escapeCsvValue(row[col.key])).join(",")
  );
  const csvContent = [header, ...rows].join("\n");
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

/**
 * Triggers a file download from a Blob.
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   data: Array<Record<string, unknown>>,
 *   columns: Array<{key: string, label: string}>,
 *   filename?: string
 * }} props
 */
export function ExportCsvModal({
  open,
  onClose,
  data,
  columns,
  filename = "export.csv",
}) {
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(columns.map((col) => col.key))
  );

  const allSelected = selectedKeys.size === columns.length;
  const noneSelected = selectedKeys.size === 0;

  const handleToggle = useCallback((key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(columns.map((col) => col.key)));
    }
  }, [allSelected, columns]);

  const selectedColumns = useMemo(
    () => columns.filter((col) => selectedKeys.has(col.key)),
    [columns, selectedKeys]
  );

  const handleExport = useCallback(() => {
    if (selectedColumns.length === 0) return;
    const blob = generateCsvBlob(data, selectedColumns);
    triggerDownload(blob, filename);
    onClose();
  }, [data, selectedColumns, filename, onClose]);

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export to CSV</DialogTitle>
          <DialogDescription>
            Select columns to include in the export:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Select All */}
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = !allSelected && !noneSelected;
              }}
              onChange={handleToggleAll}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Select All
          </label>

          {/* Individual columns */}
          <div className="flex flex-col gap-1.5 pl-2">
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.has(col.key)}
                  onChange={() => handleToggle(col.key)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={noneSelected}>
            <Download className="mr-1.5 h-4 w-4" />
            Export ({selectedColumns.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
