import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function importFromExcel(file, columns) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const headerMap = {};
        for (const col of columns) {
          headerMap[col.header.toLowerCase().trim()] = col.key;
        }

        const rows = rawRows.map((raw) => {
          const mapped = {};
          for (const [rawKey, value] of Object.entries(raw)) {
            const key = headerMap[rawKey.toLowerCase().trim()];
            if (key) mapped[key] = value;
          }
          return mapped;
        });

        resolve(rows);
      } catch (err) {
        reject(new Error("Failed to parse file: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate(columns, fileName) {
  const headers = columns.map((col) => col.header);
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 4, 15) }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}_template.xlsx`);
}
