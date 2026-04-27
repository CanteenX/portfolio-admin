import { useEffect, useState, useCallback } from "react";
import ReactApexChart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { useTheme } from "../core/theme/ThemeContext";
import { getDashboardKpis, getAuditLog } from "../shared/sdk/system";
import { GreetingBanner } from "../components/dashboard/GreetingBanner";
import { StatCard } from "../components/dashboard/StatCard";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Ticket, ListChecks, CalendarDays, Handshake, DollarSign,
  Briefcase, ClipboardList, Plus, CalendarPlus, UserPlus,
  Activity, LogIn, Pencil, Trash2, Eye, Shield,
} from "lucide-react";

const ACTION_ICONS = {
  LOGIN: LogIn, CREATE: Plus, UPDATE: Pencil, DELETE: Trash2,
  READ: Eye, PERMISSION_CHANGE: Shield, DEFAULT: Activity,
};

const ACTION_COLORS = {
  LOGIN: "text-blue-500 bg-blue-500/10",
  CREATE: "text-green-500 bg-green-500/10",
  UPDATE: "text-amber-500 bg-amber-500/10",
  DELETE: "text-red-500 bg-red-500/10",
  READ: "text-sky-500 bg-sky-500/10",
  DEFAULT: "text-muted-foreground bg-muted",
};

function buildRevenueOptions(isDark) {
  const fg = isDark ? "#cbd5e1" : "#475569";
  const grid = isDark ? "#334155" : "#e2e8f0";
  return {
    chart: { type: "area", toolbar: { show: false }, background: "transparent" },
    colors: ["#3b82f6", "#f97316"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: { style: { colors: fg } },
    },
    yaxis: { labels: { style: { colors: fg }, formatter: (v) => `$${(v / 1000).toFixed(0)}k` } },
    grid: { borderColor: grid, strokeDashArray: 4 },
    tooltip: { theme: isDark ? "dark" : "light" },
    legend: { labels: { colors: fg } },
    theme: { mode: isDark ? "dark" : "light" },
  };
}

const REVENUE_SERIES = [
  { name: "Revenue", data: [18000, 22000, 19500, 27000, 25000, 31000, 28000, 35000, 32000, 38000, 36000, 42000] },
  { name: "Expenses", data: [12000, 14000, 13500, 16000, 15000, 18000, 17000, 20000, 19000, 22000, 21000, 24000] },
];

function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function DashboardSkeleton() {
  return (
    <section className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-96" />
        <Skeleton className="h-96" />
      </div>
    </section>
  );
}

function ActivityFeed({ entries, loading }) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold uppercase tracking-wider">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold uppercase tracking-wider">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
            {entries.map((entry) => {
              const actionType = (entry.action || "").toUpperCase();
              const Icon = ACTION_ICONS[actionType] || ACTION_ICONS.DEFAULT;
              const colorClass = ACTION_COLORS[actionType] || ACTION_COLORS.DEFAULT;
              return (
                <div key={entry._id} className="relative pb-5 last:pb-0">
                  <div className={`absolute left-[-22px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-medium leading-tight">
                    {entry.action} {entry.entity}
                    {entry.entityId && <span className="text-muted-foreground"> #{entry.entityId.slice(-6)}</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{entry.userEmail || "System"}</p>
                    <span className="text-xs text-muted-foreground/50">·</span>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: "New Ticket", icon: Plus, path: "/modules/support-tickets", color: "text-red-500" },
    { label: "New Task", icon: ListChecks, path: "/modules/tasks", color: "text-blue-500" },
    { label: "New Event", icon: CalendarPlus, path: "/modules/calendar", color: "text-green-500" },
    { label: "New Contact", icon: UserPlus, path: "/modules/crm", color: "text-violet-500" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold uppercase tracking-wider">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((a) => (
            <Button
              key={a.label}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50"
              onClick={() => navigate(a.path)}
            >
              <a.icon className={`w-5 h-5 ${a.color}`} />
              <span className="text-xs font-bold uppercase tracking-wider">{a.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { api, session } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [kpis, setKpis] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiData, auditData] = await Promise.all([
        getDashboardKpis(api),
        getAuditLog(api, { limit: 10 }),
      ]);
      setKpis(kpiData);
      setActivities(auditData.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !kpis) {
    return <DashboardSkeleton />;
  }

  if (error && !kpis) {
    return (
      <section className="space-y-6">
        <Breadcrumb title="Dashboard" items={[{ label: "Home", path: "/" }, { label: "Dashboard" }]} />
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchData}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const statCards = [
    { title: "Open Tickets", value: kpis?.openTickets || 0, icon: Ticket, color: "destructive", subtitle: "Support requests" },
    { title: "Active Tasks", value: kpis?.activeTasks || 0, icon: ListChecks, color: "primary", subtitle: "In progress" },
    { title: "Today's Events", value: kpis?.todayEvents || 0, icon: CalendarDays, color: "green-500", subtitle: "Scheduled" },
    { title: "Open Deals", value: kpis?.openDeals || 0, icon: Handshake, color: "amber-500", subtitle: "In pipeline" },
    { title: "Pipeline Value", value: kpis?.pipelineValue || 0, icon: DollarSign, color: "emerald-500", prefix: "$", subtitle: "Total opportunity" },
    { title: "Open Positions", value: kpis?.openJobs || 0, icon: Briefcase, color: "violet-500", subtitle: "Job postings" },
    { title: "Pending Apps", value: kpis?.pendingApplications || 0, icon: ClipboardList, color: "sky-500", subtitle: "Applications" },
  ];

  const userName = session?.user?.email?.split("@")[0] || "Admin";

  return (
    <section className="space-y-6">
      <Breadcrumb title="Dashboard" items={[{ label: "Home", path: "/" }, { label: "Dashboard" }]} />

      <GreetingBanner userName={userName} />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.slice(4).map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Revenue Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold uppercase tracking-wider">Revenue Overview</CardTitle>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm">Sample Data</span>
              </div>
            </CardHeader>
            <CardContent>
              <ReactApexChart options={buildRevenueOptions(isDark)} series={REVENUE_SERIES} type="area" height={350} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed entries={activities} loading={loading} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </section>
  );
}
