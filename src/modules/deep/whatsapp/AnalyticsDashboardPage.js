/**
 * WhatsApp Analytics Dashboard Page
 *
 * Comprehensive analytics and reporting for WhatsApp campaigns.
 * Features:
 * - Date range picker and campaign filter
 * - KPI cards: Total Sent, Delivery Rate, Read Rate, Failed Messages
 * - Delivery funnel visualization
 * - Daily breakdown chart (sent/delivered/read/failed over time)
 * - Template performance table
 * - Export to CSV functionality
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TablePagination } from "../../../components/common/TablePagination";
import { SortableHeader } from "../../../components/common/SortableHeader";
import { StatCard } from "../../../components/dashboard/StatCard";
import { usePagination } from "../../../hooks/usePagination";
import { useTableSort } from "../../../hooks/useTableSort";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Send,
  CheckCircle,
  Eye,
  XCircle,
  TrendingUp,
  Download,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";

const DATE_RANGES = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

export function AnalyticsDashboardPage() {
  const { api } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [dateRange, setDateRange] = useState("7d");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load campaigns for filter
  async function loadCampaigns() {
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.listCampaigns();

      const mockCampaigns = [
        { _id: "campaign1", name: "Spring Sale 2024" },
        { _id: "campaign2", name: "Product Launch" },
        { _id: "campaign3", name: "Customer Survey" },
      ];

      setCampaigns(mockCampaigns);
    } catch {
      // ignore
    }
  }

  // Calculate date range
  function getDateRange() {
    const now = new Date();
    let start, end;

    if (dateRange === "custom") {
      start = startDate ? new Date(startDate) : null;
      end = endDate ? new Date(endDate) : null;
    } else {
      const days = parseInt(dateRange);
      end = now;
      start = new Date(now);
      start.setDate(start.getDate() - days);
    }

    return {
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    };
  }

  // Load analytics data
  async function loadAnalytics() {
    setError(null);
    setLoading(true);

    try {
      const { startDate: start, endDate: end } = getDateRange();

      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.getCampaignAnalytics({
      //   campaignId: campaignFilter || undefined,
      //   startDate: start,
      //   endDate: end,
      // });

      // Mock data
      const mockAnalytics = {
        summary: {
          totalSent: 12450,
          totalDelivered: 11820,
          totalRead: 9380,
          totalFailed: 630,
          deliveryRate: 94.9,
          readRate: 79.4,
        },
        deliveryFunnel: [
          { stage: "Total Sent", count: 12450, percentage: 100 },
          { stage: "Delivered", count: 11820, percentage: 94.9 },
          { stage: "Read", count: 9380, percentage: 79.4 },
        ],
        daily: [
          {
            date: "2024-04-08",
            sent: 1250,
            delivered: 1180,
            read: 950,
            failed: 70,
          },
          {
            date: "2024-04-09",
            sent: 1800,
            delivered: 1720,
            read: 1350,
            failed: 80,
          },
          {
            date: "2024-04-10",
            sent: 1650,
            delivered: 1580,
            read: 1240,
            failed: 70,
          },
          {
            date: "2024-04-11",
            sent: 2100,
            delivered: 1995,
            read: 1580,
            failed: 105,
          },
          {
            date: "2024-04-12",
            sent: 1950,
            delivered: 1860,
            read: 1480,
            failed: 90,
          },
          {
            date: "2024-04-13",
            sent: 1850,
            delivered: 1750,
            read: 1390,
            failed: 100,
          },
          {
            date: "2024-04-14",
            sent: 1850,
            delivered: 1735,
            read: 1390,
            failed: 115,
          },
        ],
        templateStats: [
          {
            templateId: "tmpl1",
            templateName: "Order Confirmation",
            totalSent: 4250,
            deliveredCount: 4050,
            readCount: 3280,
            failedCount: 200,
            deliveryRate: 95.3,
            readRate: 81.0,
          },
          {
            templateId: "tmpl2",
            templateName: "Payment Reminder",
            totalSent: 3800,
            deliveredCount: 3610,
            readCount: 2890,
            failedCount: 190,
            deliveryRate: 95.0,
            readRate: 80.1,
          },
          {
            templateId: "tmpl3",
            templateName: "Shipping Update",
            totalSent: 2600,
            deliveredCount: 2480,
            readCount: 1950,
            failedCount: 120,
            deliveryRate: 95.4,
            readRate: 78.6,
          },
          {
            templateId: "tmpl4",
            templateName: "Promotional Message",
            totalSent: 1800,
            deliveredCount: 1680,
            readCount: 1260,
            failedCount: 120,
            deliveryRate: 93.3,
            readRate: 75.0,
          },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError("Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }

  // Export to CSV
  function handleExportCSV() {
    if (!analytics) return;

    try {
      // Create CSV content
      let csv = "WhatsApp Campaign Analytics Report\n\n";

      // Summary
      csv += "Summary\n";
      csv += "Total Sent,Total Delivered,Total Read,Total Failed,Delivery Rate (%),Read Rate (%)\n";
      csv += `${analytics.summary.totalSent},${analytics.summary.totalDelivered},${analytics.summary.totalRead},${analytics.summary.totalFailed},${analytics.summary.deliveryRate.toFixed(2)},${analytics.summary.readRate.toFixed(2)}\n\n`;

      // Daily breakdown
      csv += "Daily Breakdown\n";
      csv += "Date,Sent,Delivered,Read,Failed\n";
      analytics.daily.forEach((day) => {
        csv += `${day.date},${day.sent},${day.delivered},${day.read},${day.failed}\n`;
      });
      csv += "\n";

      // Template stats
      csv += "Template Performance\n";
      csv += "Template Name,Total Sent,Delivered,Read,Failed,Delivery Rate (%),Read Rate (%)\n";
      analytics.templateStats.forEach((tmpl) => {
        csv += `${tmpl.templateName},${tmpl.totalSent},${tmpl.deliveredCount},${tmpl.readCount},${tmpl.failedCount},${tmpl.deliveryRate.toFixed(2)},${tmpl.readRate.toFixed(2)}\n`;
      });

      // Download CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `whatsapp-analytics-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Analytics exported to CSV");
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  }

  // Sort template stats
  const { sortedData, sortKey, sortDirection, toggleSort: handleSort } = useTableSort({
    data: analytics?.templateStats || [],
  });

  // Apply pagination
  const {
    paginatedData,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    startIndex,
    PAGE_SIZE_OPTIONS,
  } = usePagination({ data: sortedData, initialPageSize: 10 });

  // Load initial data
  useEffect(() => {
    loadCampaigns();
  }, [api]);

  // Reload analytics when filters change
  useEffect(() => {
    if (dateRange !== "custom" || (startDate && endDate)) {
      loadAnalytics();
    }
  }, [dateRange, campaignFilter, startDate, endDate, api]);

  // Format date for display
  function formatDate(dateString) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  }

  // Custom tooltip for chart
  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload) return null;

    return (
      <div className="bg-background border rounded-sm p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="Analytics Dashboard"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Analytics" },
          ]}
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        title="Analytics Dashboard"
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Analytics" },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Filters */}
      <Card className="industrial-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  />
                </div>
              </>
            )}

            <Select value={campaignFilter || "all"} onValueChange={(value) => setCampaignFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[200px] text-sm">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="font-bold uppercase tracking-wider"
                disabled={!analytics}
              >
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Messages Sent"
              value={analytics.summary.totalSent}
              icon={Send}
              color="primary"
            />
            <StatCard
              title="Delivery Rate"
              value={`${analytics.summary.deliveryRate.toFixed(1)}%`}
              icon={CheckCircle}
              color="primary"
              subtitle={`${analytics.summary.totalDelivered.toLocaleString()} delivered`}
            />
            <StatCard
              title="Read Rate"
              value={`${analytics.summary.readRate.toFixed(1)}%`}
              icon={Eye}
              color="primary"
              subtitle={`${analytics.summary.totalRead.toLocaleString()} read`}
            />
            <StatCard
              title="Failed Messages"
              value={analytics.summary.totalFailed}
              icon={XCircle}
              color="destructive"
            />
          </div>

          {/* Delivery Funnel */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Delivery Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.deliveryFunnel.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{stage.stage}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stage.count.toLocaleString()}
                        </Badge>
                      </div>
                      <span className="text-sm font-bold">{stage.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-8 bg-muted rounded-sm overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${
                          index === 0
                            ? "bg-blue-500"
                            : index === 1
                            ? "bg-green-500"
                            : "bg-purple-500"
                        } transition-all duration-500`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium mix-blend-difference text-white">
                          {stage.count.toLocaleString()} messages
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown Chart */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={analytics.daily}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    className="text-xs"
                    stroke="currentColor"
                  />
                  <YAxis className="text-xs" stroke="currentColor" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", fontWeight: "600" }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    name="Sent"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    name="Delivered"
                    stackId="2"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="read"
                    name="Read"
                    stackId="3"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="Failed"
                    stackId="4"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Template Performance Table */}
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Template Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Template Name"
                          sortKey="templateName"
                          currentSortKey={sortKey}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Total Sent"
                          sortKey="totalSent"
                          currentSortKey={sortKey}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Delivery Rate (%)"
                          sortKey="deliveryRate"
                          currentSortKey={sortKey}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Read Rate (%)"
                          sortKey="readRate"
                          currentSortKey={sortKey}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Failed Count"
                          sortKey="failedCount"
                          currentSortKey={sortKey}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No template data available</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((template, index) => (
                        <TableRow key={template.templateId}>
                          <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                          <TableCell className="font-medium">{template.templateName}</TableCell>
                          <TableCell>{template.totalSent.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {template.deliveryRate.toFixed(1)}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({template.deliveredCount.toLocaleString()})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.readRate.toFixed(1)}%</span>
                              <span className="text-xs text-muted-foreground">
                                ({template.readCount.toLocaleString()})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-destructive font-medium">
                              {template.failedCount.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {paginatedData.length > 0 && (
                <div className="border-t">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    totalItems={sortedData.length}
                    startIndex={startIndex}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
