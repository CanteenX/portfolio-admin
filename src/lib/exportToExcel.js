import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel({ data, columns, fileName, sheetName = "Sheet1" }) {
  if (!data || data.length === 0) return false;

  const headers = columns.map((col) => col.header);
  const rows = data.map((row, rowIndex) =>
    columns.map((col) => {
      const value = row[col.key];
      return col.transform ? col.transform(value, row, rowIndex) : (value ?? "");
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  const colWidths = headers.map((header, idx) => {
    const maxDataLen = rows.reduce((max, r) => {
      const cellLen = String(r[idx] ?? "").length;
      return cellLen > max ? cellLen : max;
    }, header.length);
    return { wch: Math.min(maxDataLen + 2, 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
  return true;
}
