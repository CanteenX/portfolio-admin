import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const PAGES = [
  { label: "Dashboard", path: "/" },
  { label: "Support Tickets", path: "/modules/tickets" },
  { label: "Tasks", path: "/modules/tasks" },
  { label: "Calendar", path: "/modules/calendar" },
  { label: "CRM", path: "/modules/crm" },
  { label: "To-Do", path: "/modules/todo" },
  { label: "Projects", path: "/modules/projects" },
  { label: "Job Portal", path: "/modules/jobs" },
  { label: "E-Commerce", path: "/modules/ecommerce" },
  { label: "Invoices", path: "/modules/invoices" },
  { label: "Chat", path: "/modules/chat" },
  { label: "Mailbox", path: "/modules/mailbox" },
  { label: "File Manager", path: "/modules/filemanager" },
  { label: "API Management", path: "/settings/api" },
  { label: "Payment Settings", path: "/settings/payments" },
  { label: "Audit Log", path: "/settings/audit" },
  { label: "System Settings", path: "/settings/system" },
  { label: "Branding", path: "/settings/branding" },
  { label: "Roles", path: "/rbac/roles" },
  { label: "Notifications", path: "/notifications" },
];

export default function SearchDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : PAGES;

  const handleSelect = useCallback(
    (path) => {
      setOpen(false);
      setQuery("");
      navigate(path);
    },
    [navigate]
  );

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Search"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
          Ctrl+K
        </kbd>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-md border border-border bg-card shadow-lg z-50">
          <div className="p-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-1 pb-1">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No results found</p>
            )}
            {filtered.map((page) => (
              <button
                key={page.path}
                type="button"
                onClick={() => handleSelect(page.path)}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {page.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
