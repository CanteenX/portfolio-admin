import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart, MessageSquare, AlertTriangle, CreditCard, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TABS = ["All", "Messages", "Alerts"];

const NOTIFICATIONS = [
  { id: 1, icon: ShoppingCart, title: "Your order is placed", desc: "Order #2451 has been confirmed and is being processed.", time: "2 min ago", tab: "All", color: "text-blue-500" },
  { id: 2, icon: MessageSquare, title: "New message from Sarah", desc: "Hey, can you review the latest design mockups?", time: "15 min ago", tab: "Messages", color: "text-green-500" },
  { id: 3, icon: AlertTriangle, title: "Server CPU at 92%", desc: "Production server load is above threshold.", time: "30 min ago", tab: "Alerts", color: "text-amber-500" },
  { id: 4, icon: CreditCard, title: "Payment completed", desc: "Invoice #1847 payment of $2,450 received.", time: "1 hr ago", tab: "All", color: "text-emerald-500" },
  { id: 5, icon: UserPlus, title: "New user registered", desc: "John Doe created an account via Google SSO.", time: "2 hrs ago", tab: "All", color: "text-purple-500" },
  { id: 6, icon: MessageSquare, title: "Message from Alex", desc: "The API integration is ready for testing.", time: "3 hrs ago", tab: "Messages", color: "text-green-500" },
  { id: 7, icon: AlertTriangle, title: "Disk space warning", desc: "Storage volume is at 85% capacity.", time: "5 hrs ago", tab: "Alerts", color: "text-red-500" },
];

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const count = 4;

  const filtered = activeTab === "All"
    ? NOTIFICATIONS
    : NOTIFICATIONS.filter((n) => n.tab === activeTab);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative text-muted-foreground hover:text-foreground h-9 w-9">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {count}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 bg-card border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            {count} New
          </Badge>
        </div>

        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-h-72 overflow-y-auto">
          {filtered.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border last:border-b-0"
              >
                <div className={`mt-0.5 shrink-0 ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{n.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="w-full py-2.5 text-xs font-medium text-primary hover:bg-accent/50 transition-colors"
          >
            View All Notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
