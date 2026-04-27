import { useEffect, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } from "@admin-platform/shared-sdk";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";

const TYPE_CLASSES = {
  info: "bg-info/20 text-info border-info/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  error: "bg-destructive/20 text-destructive border-destructive/30",
  success: "bg-success/20 text-success border-success/30",
};

export default function NotificationsPage() {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!api) return;
    Promise.all([getNotifications(api, { limit: 50 }), getUnreadCount(api)])
      .then(([res, count]) => { setNotifications(res.items); setUnread(count); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [api]);

  const handleMarkRead = async (id) => {
    if (!api) return;
    await markNotificationRead(api, id);
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread(Math.max(0, unread - 1));
  };

  const handleMarkAllRead = async () => {
    if (!api) return;
    await markAllNotificationsRead(api);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  if (loading) return (
    <div className="space-y-3 max-w-2xl">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-sm" />)}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumb title="Notifications" items={[{ label: "Home", path: "/" }, { label: "Notifications" }]} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {unread > 0 && <Badge className="bg-destructive text-destructive-foreground">{unread} unread</Badge>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`industrial-card cursor-pointer transition-all ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${TYPE_CLASSES[n.type] || ""}`}>
                      {n.type}
                    </span>
                    <strong className="text-sm">{n.title}</strong>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
