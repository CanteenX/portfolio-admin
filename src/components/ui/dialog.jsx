import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

/**
 * Dialog built with createPortal instead of the native <dialog> element.
 *
 * The native <dialog>.showModal() places the element in the browser top layer,
 * which sits above all z-index stacking contexts. Any Radix portal (SelectContent,
 * TooltipContent, etc.) renders into document.body and is therefore invisible
 * behind the top-layer dialog — regardless of z-index.
 *
 * Using createPortal keeps everything in the normal stacking context so that
 * Radix portals (z-50) render correctly on top of the dialog backdrop (z-50)
 * because they appear later in the DOM paint order.
 */

const DialogContext = React.createContext({ onClose: () => {} })

function Dialog({ open, onOpenChange, children }) {
  const handleClose = React.useCallback(() => {
    if (onOpenChange) onOpenChange(false)
  }, [onOpenChange])

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") handleClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, handleClose])

  // Prevent body scroll while open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return createPortal(
    <DialogContext.Provider value={{ onClose: handleClose }}>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={handleClose}
      />
      {/* Centering container — clicks on padding close dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      >
        {children}
      </div>
    </DialogContext.Provider>,
    document.body
  )
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { onClose } = React.useContext(DialogContext)
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cn(
        "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
