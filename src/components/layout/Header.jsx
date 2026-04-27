import { useAuth } from "../../core/auth/AuthContext";
import { useLayout } from "../../core/layout/LayoutContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Menu, X, User, MessageSquare, ListChecks, Settings, Lock, LogOut,
  ChevronDown, ChevronLeft, ChevronRight, BookOpen,
} from "lucide-react";
import { FeatureGate } from "../common/FeatureGate";
import SearchDropdown from "./SearchDropdown";
import QuickLinksDropdown from "./QuickLinksDropdown";
import LanguageDropdown from "./LanguageDropdown";
import FullscreenToggle from "./FullscreenToggle";
import LightDarkToggle from "./LightDarkToggle";
import NotificationDropdown from "./NotificationDropdown";

export function Header({ mobileOpen, onToggleMobile }) {
  const { session, logout } = useAuth();
  const { sidebarSize, setSidebarSize } = useLayout();
  const navigate = useNavigate();
  const user = session?.user;
  const initials = user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-3">
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleMobile}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Desktop sidebar collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={() => setSidebarSize(sidebarSize === "default" ? "small-icon" : "default")}
        >
          {sidebarSize === "small-icon" ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {/* Quick Links */}
        <FeatureGate flagKey="header.quickLinks">
          <QuickLinksDropdown />
        </FeatureGate>

        {/* Search */}
        <FeatureGate flagKey="header.searchBar">
          <SearchDropdown />
        </FeatureGate>

        {/* Docs */}
        <button
          onClick={() => navigate("/docs")}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Documentation"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right-side actions */}
        <FeatureGate flagKey="header.languageSwitcher">
          <LanguageDropdown />
        </FeatureGate>
        <FeatureGate flagKey="header.fullscreenToggle">
          <FullscreenToggle />
        </FeatureGate>
        <FeatureGate flagKey="header.lightDarkToggle">
          <LightDarkToggle />
        </FeatureGate>
        <FeatureGate flagKey="header.notificationDropdown">
          <NotificationDropdown />
        </FeatureGate>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium uppercase tracking-wider">
                {user?.email?.split("@")[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-card border-border rounded-sm">
            {/* User info */}
            <DropdownMenuLabel className="font-normal px-3">
              <p className="text-sm font-medium">{user?.email}</p>
              <Badge variant="outline" className="mt-1 text-xs uppercase tracking-wider">
                {user?.role?.replace("_", " ")}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Menu items */}
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/modules/chat")}>
              <MessageSquare className="w-4 h-4" /> Messages
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/modules/tasks")}>
              <ListChecks className="w-4 h-4" /> Taskboard
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/settings/system")}>
              <Settings className="w-4 h-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/auth/lock-screen")}>
              <Lock className="w-4 h-4" /> Lock Screen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
