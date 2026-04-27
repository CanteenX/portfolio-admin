/**
 * Campaign Detail Page
 *
 * Displays detailed information about a specific WhatsApp campaign including:
 * - Campaign metadata (name, description, status)
 * - Tabs for Overview, Bulk Messagings, and Analytics
 * - Analytics with KPIs and daily breakdown chart
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { StatCard } from "../../../components/dashboard/StatCard";
import { AlertCircle, ArrowLeft, MessageCircle, Send, CheckCircle, Eye, XCircle } from "lucide-react";

export function CampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [bulkMessagings, setBulkMessagings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadCampaignDetails() {
    setError(null);
    try {
      // TODO: Replace with actual SDK calls
      // const campaignData = await api.whatsapp.getCampaign(campaignId);
      // const analyticsData = await api.whatsapp.getCampaignAnalytics(campaignId);

      // Mock data for now
      const mockCampaign = {
        _id: campaignId,
        name: "Spring Sale 2024",
        description: "Promotional campaign for spring season products with special discount codes",
        status: "active",
        createdAt: "2024-03-15T10:00:00Z",
        createdBy: "admin@example.com",
      };

      const mockBulkMessagings = [
        {
          _id: "bm1",
          name: "Initial Announcement",
          status: "sent",
          recipients: 1250,
          sentCount: 1250,
          deliveredCount: 1180,
          createdAt: "2024-03-15T10:30:00Z",
        },
        {
          _id: "bm2",
          name: "Reminder - 2 Days Left",
          status: "sent",
          recipients: 1180,
          sentCount: 1180,
          deliveredCount: 1150,
          createdAt: "2024-03-18T14:00:00Z",
        },
        {
          _id: "bm3",
          name: "Final Day Notice",
          status: "scheduled",
          recipients: 1150,
          sentCount: 0,
          deliveredCount: 0,
          createdAt: "2024-03-20T09:00:00Z",
        },
      ];

      const mockAnalytics = {
        totalSent: 2430,
        totalDelivered: 2330,
        totalRead: 1850,
        totalFailed: 100,
        dailyBreakdown: [
          { date: "2024-03-15", sent: 1250, delivered: 1180, read: 950, failed: 70 },
          { date: "2024-03-16", sent: 0, delivered: 0, read: 120, failed: 0 },
          { date: "2024-03-17", sent: 0, delivered: 0, read: 95, failed: 0 },
          { date: "2024-03-18", sent: 1180, delivered: 1150, read: 685, failed: 30 },
        ],
      };

      setCampaign(mockCampaign);
      setBulkMessagings(mockBulkMessagings);
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError("Failed to load campaign details");
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId, api]);

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  }

  function getBadgeVariant(status) {
    switch (status) {
      case "active":
      case "sent":
        return "default";
      case "scheduled":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "secondary";
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="Campaign Details"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Campaigns", path: "/whatsapp/campaigns" },
            { label: "Details" },
          ]}
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!campaign) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="Campaign Not Found"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Campaigns", path: "/whatsapp/campaigns" },
          ]}
        />
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Campaign not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/whatsapp/campaigns")}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        title={campaign.name}
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Campaigns", path: "/whatsapp/campaigns" },
          { label: campaign.name },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card className="industrial-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
                  {campaign.name}
                </h1>
                <Badge variant={getBadgeVariant(campaign.status)} className="uppercase text-xs">
                  {campaign.status}
                </Badge>
              </div>
              {campaign.description && (
                <p className="text-muted-foreground">{campaign.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/whatsapp/campaigns")}
              className="font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview" className="font-bold uppercase tracking-wider">
            Overview
          </TabsTrigger>
          <TabsTrigger value="bulk-messagings" className="font-bold uppercase tracking-wider">
            Bulk Messagings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-bold uppercase tracking-wider">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight">Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Campaign Name
                  </p>
                  <p className="font-medium">{campaign.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge variant={getBadgeVariant(campaign.status)} className="uppercase text-xs">
                    {campaign.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Created Date
                  </p>
                  <p className="font-medium">{formatDate(campaign.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Created By
                  </p>
                  <p className="font-medium">{campaign.createdBy || "-"}</p>
                </div>
                {campaign.description && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="font-medium">{campaign.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-messagings" className="space-y-4">
          <Card className="industrial-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Name</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Status</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Recipients</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Sent Count</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Delivered</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkMessagings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No bulk messagings found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      bulkMessagings.map((messaging, index) => (
                        <TableRow key={messaging._id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{messaging.name}</TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(messaging.status)} className="uppercase text-xs">
                              {messaging.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{messaging.recipients.toLocaleString()}</TableCell>
                          <TableCell>{messaging.sentCount.toLocaleString()}</TableCell>
                          <TableCell>{messaging.deliveredCount.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(messaging.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Sent"
                  value={analytics.totalSent}
                  icon={Send}
                  color="primary"
                />
                <StatCard
                  title="Total Delivered"
                  value={analytics.totalDelivered}
                  icon={CheckCircle}
                  color="primary"
                />
                <StatCard
                  title="Total Read"
                  value={analytics.totalRead}
                  icon={Eye}
                  color="primary"
                />
                <StatCard
                  title="Total Failed"
                  value={analytics.totalFailed}
                  icon={XCircle}
                  color="primary"
                />
              </div>

              <Card className="industrial-card">
                <CardHeader>
                  <CardTitle className="font-display uppercase tracking-tight">Daily Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="uppercase tracking-wider text-xs font-bold">Date</TableHead>
                          <TableHead className="uppercase tracking-wider text-xs font-bold">Sent</TableHead>
                          <TableHead className="uppercase tracking-wider text-xs font-bold">Delivered</TableHead>
                          <TableHead className="uppercase tracking-wider text-xs font-bold">Read</TableHead>
                          <TableHead className="uppercase tracking-wider text-xs font-bold">Failed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.dailyBreakdown.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell className="font-medium">
                              {new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }).format(new Date(day.date))}
                            </TableCell>
                            <TableCell>{day.sent.toLocaleString()}</TableCell>
                            <TableCell>{day.delivered.toLocaleString()}</TableCell>
                            <TableCell>{day.read.toLocaleString()}</TableCell>
                            <TableCell>{day.failed.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
