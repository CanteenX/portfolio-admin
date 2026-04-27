import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { getQuickLinks } from "@admin-platform/shared-sdk";
import { LayoutGrid, ExternalLink } from "lucide-react";

export default function QuickLinksDropdown() {
  const { api } = useAuth();
  const [links, setLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!api) return;
    getQuickLinks(api).then(setLinks).catch(() => {});
  }, [api]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (links.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        title="Quick Links"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[260px] z-50">
          <p className="text-sm font-semibold mb-2 px-1">Quick Links</p>
          <div className="grid grid-cols-3 gap-1">
            {links.map((link) => (
              <a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-accent transition-colors text-foreground no-underline"
              >
                {link.iconUrl ? (
                  <img
                    src={link.iconUrl}
                    alt={link.name}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <ExternalLink className="w-7 h-7 text-primary" />
                )}
                <span className="text-[11px] text-center leading-tight">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
