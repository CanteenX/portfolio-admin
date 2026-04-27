import { useState, useCallback, useRef } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { GripVertical } from "lucide-react";

/**
 * @param {{
 *   columns: Array<{key: string, label: string, render?: (row: Record<string, unknown>) => import("react").ReactNode}>,
 *   data: Array<Record<string, unknown>>,
 *   idField?: string,
 *   onReorder: (dragIndex: number, dropIndex: number) => void
 * }} props
 */
export function DraggableDataTable({
  columns,
  data,
  idField = "id",
  onReorder,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const dragImageRef = useRef(null);

  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));

    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTargetIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e, dropIdx) => {
      e.preventDefault();
      const dragIdx = Number(e.dataTransfer.getData("text/plain"));
      setDragIndex(null);
      setDropTargetIndex(null);

      if (dragIdx !== dropIdx) {
        onReorder(dragIdx, dropIdx);
      }
    },
    [onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropTargetIndex(null);
  }, []);

  const getRowId = (row, index) => {
    const id = row[idField];
    return id != null ? String(id) : `row-${index}`;
  };

  return (
    <div>
      {/* Hidden drag image placeholder */}
      <div
        ref={dragImageRef}
        style={{ position: "absolute", top: -9999, left: -9999 }}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-center py-8 text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const isDragging = dragIndex === index;
              const isDropTarget = dropTargetIndex === index;

              return (
                <TableRow
                  key={getRowId(row, index)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={[
                    "transition-all duration-150 cursor-grab active:cursor-grabbing",
                    isDragging ? "opacity-40" : "opacity-100",
                    isDropTarget
                      ? "bg-accent border-t-2 border-t-primary"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <TableCell className="w-12 px-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </TableCell>

                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(row)
                        : (row[col.key] != null ? String(row[col.key]) : "")}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
