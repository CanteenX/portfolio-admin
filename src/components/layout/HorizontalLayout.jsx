import { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { canReadModule } from "@admin-platform/shared-rbac";
import { MODULE_DEFINITIONS } from "@admin-platform/shared-types";
import { useAuth } from "../../core/auth/AuthContext";
import { useLayout } from "../../core/layout/LayoutContext";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  LayoutDashboard, Ticket, ListChecks, CalendarDays, Users, CheckSquare,
  FolderKanban, Briefcase, ShoppingCart, FileText, MessageSquare, Mail,
  HardDrive, KeyRound, CreditCard, ScrollText, Settings, Palette, Shield,
  Bell, LogOut, ChevronDown, Menu, X, Layers,
} from "lucide-react";

const MODULE_ICONS = {
  "support-tickets": Ticket, tasks: ListChecks, calendar: CalendarDays,
  crm: Users, todo: CheckSquare, projects: FolderKanban, job: Briefcase,
  ecommerce: ShoppingCart, invoices: FileText, chat: MessageSquare,
  mailbox: Mail, "file-manager": HardDrive, "api-management": KeyRound,
};

const SETTINGS_LINKS = [
  { path: "/settings/payments", label: "Payments", icon: CreditCard },
  { path: "/settings/audit-log", label: "Audit Log", icon: ScrollText },
  { path: "/settings/system", label: "System", icon: Settings },
  { path: "/settings/branding", label: "Branding", icon: Palette },
  { path: "/settings/custom-roles", label: "Roles", icon: Shield },
];

export function HorizontalLayout({ children }) {
  const { session, logout } = useAuth();
  const { layoutWidth } = useLayout();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const permissions = new Set(session?.permissions || []);

  const menuModules = useMemo(
    () => MODULE_DEFINITIONS.filter((m) =>
      session ? canReadModule(session.user.role, permissions, session.features, m.key) : false
    ),
    [session, permissions]
  );

  const isActive = useCallback(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/"),
    [location.pathname]
  );

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const containerClass = layoutWidth === "boxed" ? "max-w-7xl mx-auto px-4" : "px-4 lg:px-6";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className={`flex items-center gap-4 py-3 ${containerClass}`}>
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Layers className="w-7 h-7 text-primary" />
            <span className="font-display text-lg font-bold tracking-tight uppercase text-foreground hidden sm:inline">
              Admin Platform
            </span>
          </Link>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" asChild>
              <a href="/notifications"><Bell className="w-4 h-4" /></a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {session?.user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-sm">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{session?.user?.email}</p>
                  <p className="text-xs text-muted-foreground uppercase">{session?.user?.role?.replace("_", " ")}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 text-destructive" onClick={logout}>
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Horizontal nav bar (desktop) */}
        <nav className={`hidden lg:flex items-center gap-1 py-1.5 overflow-x-auto ${containerClass}`}>
          <NavItem to="/" label="Dashboard" Icon={LayoutDashboard} active={isActive("/")} />
          {menuModules.map((m) => {
            const Icon = MODULE_ICONS[m.key] || Layers;
            return <NavItem key={m.key} to={`/modules/${m.key}`} label={m.label} Icon={Icon} active={isActive(`/modules/${m.key}`)} />;
          })}
          {session?.user.role === "super_admin" && SETTINGS_LINKS.map((s) => (
            <NavItem key={s.path} to={s.path} label={s.label} Icon={s.icon} active={isActive(s.path)} />
          ))}
        </nav>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-lg z-20">
          <nav className="p-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
            <MobileNavItem to="/" label="Dashboard" Icon={LayoutDashboard} active={isActive("/")} onClick={closeMobile} />
            {menuModules.map((m) => {
              const Icon = MODULE_ICONS[m.key] || Layers;
              return <MobileNavItem key={m.key} to={`/modules/${m.key}`} label={m.label} Icon={Icon} active={isActive(`/modules/${m.key}`)} onClick={closeMobile} />;
            })}
            {session?.user.role === "super_admin" && SETTINGS_LINKS.map((s) => (
              <MobileNavItem key={s.path} to={s.path} label={s.label} Icon={s.icon} active={isActive(s.path)} onClick={closeMobile} />
            ))}
            <MobileNavItem to="/notifications" label="Notifications" Icon={Bell} active={isActive("/notifications")} onClick={closeMobile} />
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 p-4 lg:p-6 overflow-auto ${layoutWidth === "boxed" ? "max-w-7xl mx-auto w-full" : ""}`}>
        {children}
      </main>
    </div>
  );
}

function NavItem({ to, label, Icon, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap
        ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Link>
  );
}

function MobileNavItem({ to, label, Icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors
        ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {label}
    </Link>
  );
}
