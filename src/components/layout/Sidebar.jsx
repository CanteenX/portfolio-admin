import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { useLayout } from "../../core/layout/LayoutContext";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  LayoutDashboard, Ticket, ListChecks, CalendarDays, Users, CheckSquare,
  FolderKanban, Briefcase, ShoppingCart, FileText, MessageSquare, Mail,
  HardDrive, KeyRound, CreditCard, ScrollText, Settings, Palette, Shield,
  Bell, LogOut, User, ChevronLeft, ChevronRight, Layers, BarChart3, PieChart,
  Layout, FileEdit, FormInput, Wand2, Map, MapPin,
  HelpCircle, Clock, Image, Users2, Search, Gem, MessageCircle, Sparkles,
  ToggleLeft, ListTree, Activity, Bolt, Database, Globe, Home, Link2,
  Package, Tag, Truck, Wallet, ChevronDown, ChevronUp, Menu, Headphones,
} from "lucide-react";

// Map icon name strings (stored in MenuMaster) to Lucide components
const ICON_MAP = {
  LayoutDashboard, Ticket, ListChecks, CalendarDays, Users, CheckSquare,
  FolderKanban, Briefcase, ShoppingCart, FileText, MessageSquare, Mail,
  HardDrive, KeyRound, CreditCard, ScrollText, Settings, Palette, Shield,
  Bell, LogOut, User, Layers, BarChart3, PieChart, Layout, FileEdit,
  FormInput, Wand2, Map, MapPin, HelpCircle, Clock, Image, Users2,
  Search, Gem, MessageCircle, Sparkles, ToggleLeft, ListTree, Activity,
  Bolt, Database, Globe, Home, Link2, Package, Tag, Truck, Wallet, Menu,
  Headphones,
};

function resolveIcon(iconName) {
  return ICON_MAP[iconName] || Layers;
}

function getSidebarWidth(sidebarSize) {
  switch (sidebarSize) {
    case "compact": return "w-52";
    case "small-icon": return "w-16";
    case "small-hover": return "w-16";
    default: return "w-64";
  }
}

function getThemeClasses(sidebarTheme) {
  switch (sidebarTheme) {
    case "light":
      return "bg-white text-gray-800 border-gray-200";
    case "gradient":
      return "bg-gradient-to-b from-indigo-900 via-violet-900 to-purple-900 text-white border-violet-800";
    default:
      return "bg-card text-card-foreground border-border";
  }
}

function getNavActiveClass(sidebarTheme) {
  if (sidebarTheme === "light") return "bg-primary text-white";
  return "bg-primary text-primary-foreground glow-primary";
}

function getNavInactiveClass(sidebarTheme) {
  if (sidebarTheme === "light") return "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  if (sidebarTheme === "gradient") return "text-white/70 hover:bg-white/10 hover:text-white";
  return "text-muted-foreground hover:bg-muted hover:text-foreground";
}

function buildMenuTree(allowedMenus) {
  const roots = [];
  const childrenByParentId = {};

  for (const menu of allowedMenus) {
    const id = String(menu._id);
    if (menu.isRoot || !menu.parentMenu) {
      roots.push({ ...menu, id });
    } else {
      const parentId = String(menu.parentMenu);
      if (!childrenByParentId[parentId]) childrenByParentId[parentId] = [];
      childrenByParentId[parentId].push({ ...menu, id });
    }
  }

  return roots.map((root) => ({
    ...root,
    children: (childrenByParentId[root.id] || []).sort((a, b) => a.sequence - b.sequence),
  }));
}

function NavLink({ path, label, Icon, isActive, isCollapsed, isCompact, paddingClass, textSizeClass, activeClass, inactiveClass, onClick }) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center rounded-sm transition-all duration-150
        ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 px-4 py-3 gap-3" : paddingClass}
        ${isActive ? activeClass : inactiveClass}
        ${textSizeClass} font-bold uppercase tracking-wider`}
    >
      <Icon className={`${isCompact ? "w-4 h-4" : "w-5 h-5"} flex-shrink-0`} />
      <span className={isCollapsed ? "lg:hidden" : ""}>{label}</span>
    </Link>
  );
}

function CollapsibleSection({ root, location, isCollapsed, isCompact, textSizeClass, paddingClass, activeClass, inactiveClass, onClose }) {
  const Icon = resolveIcon(root.icon);
  const hasChildren = root.children.length > 0;

  // Auto-open section if current path matches any child
  const isAnyChildActive = root.children.some(
    (c) => location.pathname === c.menuUrl || location.pathname.startsWith(c.menuUrl + "/")
  );
  const isRootActive = location.pathname === root.menuUrl || location.pathname.startsWith(root.menuUrl + "/");
  const [open, setOpen] = useState(isAnyChildActive || isRootActive);

  if (!hasChildren) {
    return (
      <NavLink
        path={root.menuUrl}
        label={root.menuName}
        Icon={Icon}
        isActive={isRootActive}
        isCollapsed={isCollapsed}
        isCompact={isCompact}
        paddingClass={paddingClass}
        textSizeClass={textSizeClass}
        activeClass={activeClass}
        inactiveClass={inactiveClass}
        onClick={onClose}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center rounded-sm transition-all duration-150
          ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-3 px-4 py-3 gap-3" : paddingClass}
          ${isAnyChildActive ? activeClass : inactiveClass}
          ${textSizeClass} font-bold uppercase tracking-wider`}
      >
        <Icon className={`${isCompact ? "w-4 h-4" : "w-5 h-5"} flex-shrink-0`} />
        <span className={`flex-1 text-left ${isCollapsed ? "lg:hidden" : ""}`}>{root.menuName}</span>
        {!isCollapsed && (open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>
      {open && !isCollapsed && (
        <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
          {root.children.map((child) => {
            const ChildIcon = resolveIcon(child.icon);
            const isActive = location.pathname === child.menuUrl || location.pathname.startsWith(child.menuUrl + "/");
            return (
              <NavLink
                key={child.id}
                path={child.menuUrl}
                label={child.menuName}
                Icon={ChildIcon}
                isActive={isActive}
                isCollapsed={false}
                isCompact={isCompact}
                paddingClass={isCompact ? "px-2 py-1.5 gap-2" : "px-3 py-2 gap-2"}
                textSizeClass="text-xs"
                activeClass={activeClass}
                inactiveClass={inactiveClass}
                onClick={onClose}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RenderNavItem({ path, label, Icon, location, isCollapsed, isCompact, textSizeClass, paddingClass, activeClass, inactiveClass, onClose }) {
  const isActive = location.pathname === path || location.pathname.startsWith(path + "/");
  const link = (
    <NavLink
      path={path}
      label={label}
      Icon={Icon}
      isActive={isActive}
      isCollapsed={isCollapsed}
      isCompact={isCompact}
      paddingClass={paddingClass}
      textSizeClass={textSizeClass}
      activeClass={activeClass}
      inactiveClass={inactiveClass}
      onClick={onClose}
    />
  );
  if (isCollapsed) {
    return (
      <Tooltip key={path}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="hidden lg:block font-bold uppercase tracking-wider text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }
  return <div key={path}>{link}</div>;
}

export function Sidebar({ mobileOpen, onClose }) {
  const { session, logout } = useAuth();
  const { sidebarSize, sidebarTheme, setSidebarSize } = useLayout();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const isSmallHover = sidebarSize === "small-hover";
  const isSmallIcon = sidebarSize === "small-icon";
  const isCompact = sidebarSize === "compact";
  const isCollapsed = (isSmallIcon || (isSmallHover && !hovered)) && !mobileOpen;

  const menuTree = useMemo(() => {
    const menus = session?.rbacAllowedMenus ?? [];
    return buildMenuTree(menus);
  }, [session?.rbacAllowedMenus]);

  const sidebarWidthClass = isSmallHover && hovered ? "w-64" : getSidebarWidth(sidebarSize);
  const themeClasses = getThemeClasses(sidebarTheme);
  const activeClass = getNavActiveClass(sidebarTheme);
  const inactiveClass = getNavInactiveClass(sidebarTheme);

  const textSizeClass = isCompact ? "text-xs" : "text-sm";
  const paddingClass = isCompact ? "px-3 py-2 gap-2" : "px-4 py-3 gap-3";

  const logoTitleClass = sidebarTheme === "light" ? "text-gray-900" : sidebarTheme === "gradient" ? "text-white" : "text-foreground";
  const logoSubClass = sidebarTheme === "light" ? "text-gray-500" : sidebarTheme === "gradient" ? "text-white/60" : "text-muted-foreground";
  const borderClass = sidebarTheme === "light" ? "border-gray-200" : sidebarTheme === "gradient" ? "border-white/10" : "border-border";
  const collapseHoverClass = sidebarTheme === "light" ? "text-gray-500 hover:text-gray-800" : sidebarTheme === "gradient" ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground";

  const sharedNavProps = { location, isCollapsed, isCompact, textSizeClass, paddingClass, activeClass, inactiveClass, onClose };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        onMouseEnter={isSmallHover ? () => setHovered(true) : undefined}
        onMouseLeave={isSmallHover ? () => setHovered(false) : undefined}
        className={`fixed lg:static inset-y-0 left-0 z-50 ${themeClasses} border-r flex flex-col
          transition-[width] duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? `lg:${sidebarWidthClass.replace("w-", "w-")} w-64` : sidebarWidthClass}
          ${isCollapsed ? "lg:w-16" : ""}`}
        style={!isCollapsed && !mobileOpen ? { width: sidebarSize === "compact" ? "13rem" : sidebarSize === "default" ? "16rem" : isSmallHover && hovered ? "16rem" : undefined } : undefined}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`p-4 border-b ${borderClass}`}>
            {isCollapsed ? (
              <div className="hidden lg:flex items-center justify-center py-2">
                <Layers className="w-7 h-7 text-primary" />
              </div>
            ) : null}
            <div className={`flex items-center gap-3 ${isCollapsed ? "lg:hidden" : ""}`}>
              <Layers className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h1 className={`font-display text-xl font-bold tracking-tight uppercase ${logoTitleClass}`}>
                  Admin Platform
                </h1>
                <p className={`text-xs tracking-widest uppercase ${logoSubClass}`}>Control Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <TooltipProvider delayDuration={0}>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {menuTree.length === 0 ? (
                !isCollapsed && (
                  <p className={`px-4 py-3 text-xs uppercase tracking-widest ${logoSubClass}`}>
                    No menus assigned
                  </p>
                )
              ) : (
                menuTree.map((root) => {
                  const hasChildren = root.children.length > 0;
                  if (hasChildren) {
                    if (isCollapsed) {
                      // In collapsed mode, render children as flat tooltip items
                      return root.children.map((child) => {
                        const ChildIcon = resolveIcon(child.icon);
                        return (
                          <RenderNavItem
                            key={child.id}
                            path={child.menuUrl}
                            label={child.menuName}
                            Icon={ChildIcon}
                            {...sharedNavProps}
                          />
                        );
                      });
                    }
                    return (
                      <CollapsibleSection
                        key={root.id}
                        root={root}
                        location={location}
                        isCollapsed={isCollapsed}
                        isCompact={isCompact}
                        textSizeClass={textSizeClass}
                        paddingClass={paddingClass}
                        activeClass={activeClass}
                        inactiveClass={inactiveClass}
                        onClose={onClose}
                      />
                    );
                  }
                  const RootIcon = resolveIcon(root.icon);
                  return (
                    <RenderNavItem
                      key={root.id}
                      path={root.menuUrl}
                      label={root.menuName}
                      Icon={RootIcon}
                      {...sharedNavProps}
                    />
                  );
                })
              )}

              {/* Notifications — always visible */}
              {/* <div className="mt-2">
                <RenderNavItem path="/notifications" label="Notifications" Icon={Bell} {...sharedNavProps} />
              </div> */}
            </nav>
          </TooltipProvider>

          {/* Collapse toggle (desktop) */}
          {(sidebarSize === "default" || sidebarSize === "small-icon") && (
            <div className={`hidden lg:flex p-2 border-t ${borderClass}`}>
              <Button variant="ghost" size="icon" className={`w-full h-8 ${collapseHoverClass}`} onClick={() => setSidebarSize(sidebarSize === "default" ? "small-icon" : "default")}>
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {/* Mobile user info */}
          <div className={`p-2 border-t ${borderClass} lg:hidden`}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-sm bg-secondary/50">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.email}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{session?.user?.role}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-2 justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={logout}>
              <LogOut className="w-5 h-5" />
              <span className="uppercase tracking-wider text-sm font-bold">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
