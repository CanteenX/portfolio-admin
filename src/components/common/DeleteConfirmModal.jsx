import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * @param {{
 *   open: boolean,
 *   onConfirm: () => void,
 *   onClose: () => void,
 *   loading?: boolean,
 *   title?: string,
 *   description?: string
 * }} props
 */
export function DeleteConfirmModal({
  open,
  onConfirm,
  onClose,
  loading = false,
  title = "Are you sure?",
  description = "This action cannot be undone. The item will be permanently deleted.",
}) {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-12 w-12 text-amber-500 animate-warning-pulse" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-center gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Keyframe for the warning icon pulse animation */}
      <style>{`
        @keyframes warning-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        .animate-warning-pulse {
          animation: warning-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}
