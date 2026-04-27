import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { getAuditLog } from "../../shared/sdk/system";
import { StatCard } from "../../components/dashboard/StatCard";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import {
  ScrollText, AlertCircle, LogIn, Plus, Pencil, Trash2, Shield,
  Activity, RefreshCw, X, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, CalendarDays, Filter,
} from "lucide-react";

const ACTION_CONFIG = {
  LOGIN:    { label: "Login",   icon: LogIn,   color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  CREATE:   { label: "Create",  icon: Plus,    color: "bg-green-500/10 text-green-500 border-green-500/20" },
  UPDATE:   { label: "Update",  icon: Pencil,  color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  DELETE:   { label: "Delete",  icon: Trash2,  color: "bg-red-500/10 text-red-500 border-red-500/20" },
  PERMISSION_CHANGE: { label: "Permission", icon: Shield, color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
};

const DEFAULT_CONFIG = { label: "Action", icon: Activity, color: "bg-muted text-muted-foreground border-border" };

function getActionConfig(action) {
  const upper = (action || "").toUpperCase();
  return ACTION_CONFIG[upper] || DEFAULT_CONFIG;
}

const PAGE_SIZE = 20;

export default function AuditLogPage() {
  const { api, session } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const fetchData = useCallback(async () => {
    if (!api) return;
    try {
      setLoading(true);
      setError("");
      const params = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
      if (entityFilter) params.entity = entityFilter;
      const result = await getAuditLog(api, params);
      let filtered = result.items || [];

      // Client-side filters for action and user (backend only supports entity filter)
      if (actionFilter) {
        filtered = filtered.filter((e) => (e.action || "").toUpperCase() === actionFilter.toUpperCase());
      }
      if (userFilter) {
        const q = userFilter.toLowerCase();
        filtered = filtered.filter((e) => (e.userEmail || "").toLowerCase().includes(q));
      }

      setItems(filtered);
      setTotal(result.total || 0);
    } catch {
      setError("Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [api, page, entityFilter, actionFilter, userFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setActionFilter("");
    setEntityFilter("");
    setUserFilter("");
    setPage(0);
  };

  const hasFilters = actionFilter || entityFilter || userFilter;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (session?.user?.role !== "super_admin") {
    return <div className="text-destructive p-6">Access denied. Super admin only.</div>;
  }

  // Compute stats from all items fetched
  const todayStr = new Date().toDateString();
  const todayCount = items.filter((e) => new Date(e.createdAt).toDateString() === todayStr).length;
  const createCount = items.filter((e) => (e.action || "").toUpperCase() === "CREATE").length;
  const loginCount = items.filter((e) => (e.action || "").toUpperCase() === "LOGIN").length;

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Audit Log"
        items={[{ label: "Home", path: "/" }, { label: "Settings" }, { label: "Audit Log" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Logs" value={total} icon={ScrollText} color="primary" />
        <StatCard title="Today" value={todayCount} icon={CalendarDays} color="green-500" />
        <StatCard title="Creates" value={createCount} icon={Plus} color="amber-500" />
        <StatCard title="Logins" value={loginCount} icon={LogIn} color="sky-500" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger className="w-[160px] h-9 rounded-sm">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by entity..."
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
              className="w-[180px] h-9 rounded-sm"
            />

            <Input
              placeholder="Filter by user email..."
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setPage(0); }}
              className="w-[200px] h-9 rounded-sm"
            />

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-muted-foreground">
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}

            <div className="flex-1" />

            <Button variant="outline" size="sm" onClick={fetchData} className="h-9 gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Table */}
      <Card className="industrial-card">
        {loading ? (
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </CardContent>
        ) : items.length === 0 ? (
          <CardContent className="p-8 text-center text-muted-foreground">
            <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No audit entries found.</p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase tracking-wider text-xs font-bold w-[180px]">Timestamp</TableHead>
                <TableHead className="uppercase tracking-wider text-xs font-bold w-[120px]">Action</TableHead>
                <TableHead className="uppercase tracking-wider text-xs font-bold">Entity</TableHead>
                <TableHead className="uppercase tracking-wider text-xs font-bold">Entity ID</TableHead>
                <TableHead className="uppercase tracking-wider text-xs font-bold">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((entry) => {
                const config = getActionConfig(entry.action);
                const Icon = config.icon;
                return (
                  <TableRow key={entry._id}>
                    <TableCell className="text-xs font-mono whitespace-nowrap text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 text-xs font-mono border ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{entry.entity}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {entry.entityId ? entry.entityId.slice(-8) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.userEmail || entry.userId}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(0)}>
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-3 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
