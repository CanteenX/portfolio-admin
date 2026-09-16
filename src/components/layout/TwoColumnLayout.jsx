import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { canReadModule } from "@admin-platform/shared-rbac";
import { MODULE_DEFINITIONS } from "@admin-platform/shared-types";
import { useAuth } from "../../core/auth/AuthContext";
import { useLayout } from "../../core/layout/LayoutContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  LayoutDashboard, Ticket, ListChecks, CalendarDays, Users, CheckSquare,
  FolderKanban, Briefcase, ShoppingCart, FileText, MessageSquare, Mail,
  HardDrive, KeyRound, CreditCard, ScrollText, Settings, Palette,
  Bell, Layers,
} from "lucide-react";

const MODULE_ICONS = {
  "support-tickets": Ticket, tasks: ListChecks, calendar: CalendarDays,
  crm: Users, todo: CheckSquare, projects: FolderKanban, job: Briefcase,
  ecommerce: ShoppingCart, invoices: FileText, chat: MessageSquare,
  mailbox: Mail, "file-manager": HardDrive, "api-management": KeyRound,
};

const SETTINGS_LINKS = [
  { path: "/settings/payments", label: "Payments", icon: CreditCard, group: "settings" },
  { path: "/settings/audit-log", label: "Audit Log", icon: ScrollText, group: "settings" },
  { path: "/settings/system", label: "System", icon: Settings, group: "settings" },
  { path: "/settings/branding", label: "Branding", icon: Palette, group: "settings" },
];

export function TwoColumnLayout({ children }) {
  const { session } = useAuth();
  const { layoutWidth } = useLayout();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const permissions = new Set(session?.permissions || []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const menuModules = useMemo(
    () => MODULE_DEFINITIONS.filter((m) =>
      session ? canReadModule(session.user.role, permissions, session.features, m.key) : false
    ),
    [session, permissions]
  );

  const navGroups = useMemo(() => {
    const groups = [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard }] },
    ];

    if (menuModules.length > 0) {
      groups.push({
        id: "modules",
        icon: Layers,
        label: "Modules",
        items: menuModules.map((m) => ({
          path: `/modules/${m.key}`,
          label: m.label,
          icon: MODULE_ICONS[m.key] || Layers,
        })),
      });
    }

    if (session?.user.role === "super_admin") {
      groups.push({ id: "settings", icon: Settings, label: "Settings", items: SETTINGS_LINKS.map((s) => ({ path: s.path, label: s.label, icon: s.icon })) });
    }

    groups.push({ id: "notifications", icon: Bell, label: "Notifications", items: [{ path: "/notifications", label: "Notifications", icon: Bell }] });

    return groups;
  }, [menuModules, session]);

  // Auto-detect active group from URL
  useEffect(() => {
    const path = location.pathname;
    for (const group of navGroups) {
      if (group.items.some((item) => path === item.path || path.startsWith(item.path + "/"))) {
        setActiveGroup(group.id);
        return;
      }
    }
  }, [location.pathname, navGroups]);

  const handleGroupClick = useCallback((groupId) => {
    setActiveGroup((prev) => (prev === groupId ? null : groupId));
  }, []);

  const isItemActive = useCallback(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/"),
    [location.pathname]
  );

  // On mobile, fall back to the regular sidebar layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((o) => !o)} />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    );
  }

  const activeItems = navGroups.find((g) => g.id === activeGroup)?.items || [];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Icon column (70px) */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[70px] bg-card border-r border-border flex flex-col items-center py-3 gap-1">
        <div className="mb-3">
          <Layers className="w-7 h-7 text-primary" />
        </div>
        <TooltipProvider delayDuration={0}>
          {navGroups.map((group) => {
            const Icon = group.icon;
            const isGroupActive = activeGroup === group.id;
            return (
              <Tooltip key={group.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-10 ${isGroupActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    onClick={() => handleGroupClick(group.id)}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold uppercase tracking-wider text-xs">
                  {group.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </aside>

      {/* Submenu column (~220px, slides out) */}
      <div
        className={`fixed inset-y-0 left-[70px] z-40 bg-card border-r border-border flex flex-col transition-[width,opacity] duration-200 ease-in-out overflow-hidden
          ${activeItems.length > 0 ? "w-[220px] opacity-100" : "w-0 opacity-0"}`}
      >
        <div className="p-3 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            {navGroups.find((g) => g.id === activeGroup)?.label || ""}
          </p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {activeItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors
                  ${active ? "bg-primary text-primary-foreground glow-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: activeItems.length > 0 ? 290 : 70 }}>
        <Header mobileOpen={false} onToggleMobile={() => {}} />
        <main className={`flex-1 p-4 lg:p-6 overflow-auto ${layoutWidth === "boxed" ? "max-w-7xl mx-auto w-full" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
