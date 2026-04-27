import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * @param {{ title: string, items?: Array<{ label: string, path?: string }> }} props
 */
export function Breadcrumb({ title, items = [] }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase">{title}</h2>
      {items.length > 0 && (
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <span key={item.label} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                {isLast || !item.path ? (
                  <span className="text-muted-foreground">{item.label}</span>
                ) : (
                  <Link to={item.path} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}
    </div>
  );
}
