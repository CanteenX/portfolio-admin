/**
 * Bulk Messaging Detail Page
 *
 * Progress tracking page for WhatsApp bulk messaging campaigns:
 * - Header with status, action buttons
 * - Progress bar and KPI cards
 * - Auto-refresh when status=processing
 * - Tabs: Messages / Failed Messages
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TablePagination } from "../../../components/common/TablePagination";
import { StatCard } from "../../../components/dashboard/StatCard";
import { Progress } from "../../../components/ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Send,
  CheckCircle,
  Eye,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import { usePagination } from "../../../hooks/usePagination";

export function BulkMessagingDetailPage() {
  const { bulkMessagingId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [bulkMessaging, setBulkMessaging] = useState(null);
  const [progress, setProgress] = useState(null);
  const [messages, setMessages] = useState([]);
  const [failedMessages, setFailedMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const intervalRef = useRef(null);

  // Pagination for failed messages
  const {
    paginatedData: paginatedFailedMessages,
    currentPage: failedCurrentPage,
    totalPages: failedTotalPages,
    pageSize: failedPageSize,
    setCurrentPage: setFailedCurrentPage,
    setPageSize: setFailedPageSize,
    startIndex: failedStartIndex,
    PAGE_SIZE_OPTIONS: FAILED_PAGE_SIZE_OPTIONS,
  } = usePagination(failedMessages, 10);

  useEffect(() => {
    loadBulkMessagingDetails();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bulkMessagingId, api]);

  useEffect(() => {
    // Auto-refresh when status is "processing"
    if (bulkMessaging?.status === "processing") {
      intervalRef.current = setInterval(() => {
        loadProgressData();
      }, 10000); // Refresh every 10 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bulkMessaging?.status]);

  async function loadBulkMessagingDetails() {
    setError(null);
    try {
      // TODO: Replace with actual SDK calls
      // const data = await api.whatsapp.getBulkMessaging(bulkMessagingId);
      // const progressData = await api.whatsapp.getBulkMessagingProgress(bulkMessagingId);

      // Mock data
      const mockBulkMessaging = {
        _id: bulkMessagingId,
        name: "Spring Sale Launch",
        campaignId: "camp1",
        campaignName: "Spring Sale 2024",
        templateName: "discount_offer",
        status: "processing", // pending, processing, completed, paused, failed
        createdAt: "2024-04-15T10:00:00Z",
        createdBy: "admin@example.com",
        startedAt: "2024-04-15T10:05:00Z",
      };

      const mockProgress = {
        totalRecipients: 5000,
        queued: 2500,
        sent: 1500,
        delivered: 1200,
        read: 800,
        failed: 500,
      };

      const mockMessages = [
        {
          _id: "msg1",
          phone: "+1234567890",
          status: "read",
          sentAt: "2024-04-15T10:06:00Z",
          deliveredAt: "2024-04-15T10:06:30Z",
          readAt: "2024-04-15T10:10:00Z",
        },
        {
          _id: "msg2",
          phone: "+1234567891",
          status: "delivered",
          sentAt: "2024-04-15T10:07:00Z",
          deliveredAt: "2024-04-15T10:07:30Z",
        },
        {
          _id: "msg3",
          phone: "+1234567892",
          status: "sent",
          sentAt: "2024-04-15T10:08:00Z",
        },
        {
          _id: "msg4",
          phone: "+1234567893",
          status: "queued",
        },
        {
          _id: "msg5",
          phone: "+1234567894",
          status: "failed",
          error: "Invalid phone number",
          failedAt: "2024-04-15T10:09:00Z",
        },
      ];

      const mockFailedMessages = [
        {
          _id: "msg5",
          phone: "+1234567894",
          error: "Invalid phone number",
          errorCode: "INVALID_PHONE",
          failedAt: "2024-04-15T10:09:00Z",
          isRetryable: false,
        },
        {
          _id: "msg6",
          phone: "+1234567895",
          error: "Network timeout",
          errorCode: "NETWORK_TIMEOUT",
          failedAt: "2024-04-15T10:10:00Z",
          isRetryable: true,
        },
        {
          _id: "msg7",
          phone: "+1234567896",
          error: "Rate limit exceeded",
          errorCode: "RATE_LIMIT",
          failedAt: "2024-04-15T10:11:00Z",
          isRetryable: true,
        },
      ];

      setBulkMessaging(mockBulkMessaging);
      setProgress(mockProgress);
      setMessages(mockMessages);
      setFailedMessages(mockFailedMessages);
    } catch (err) {
      setError("Failed to load bulk messaging details");
      toast.error("Failed to load bulk messaging details");
    } finally {
      setLoading(false);
    }
  }

  async function loadProgressData() {
    try {
      // TODO: Replace with actual SDK call
      // const progressData = await api.whatsapp.getBulkMessagingProgress(bulkMessagingId);

      // Mock updated progress
      const mockProgress = {
        totalRecipients: 5000,
        queued: Math.max(0, progress.queued - 100),
        sent: progress.sent + 50,
        delivered: progress.delivered + 40,
        read: progress.read + 10,
        failed: progress.failed,
      };

      setProgress(mockProgress);
    } catch {
      // ignore
    }
  }

  async function handleStart() {
    setActionLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.startBulkMessaging(bulkMessagingId);

      toast.success("Bulk messaging started");
      setBulkMessaging((prev) => ({ ...prev, status: "processing" }));
      await loadProgressData();
    } catch (err) {
      setError("Failed to start bulk messaging");
      toast.error("Failed to start bulk messaging");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePause() {
    setActionLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.pauseBulkMessaging(bulkMessagingId);

      toast.success("Bulk messaging paused");
      setBulkMessaging((prev) => ({ ...prev, status: "paused" }));
    } catch (err) {
      setError("Failed to pause bulk messaging");
      toast.error("Failed to pause bulk messaging");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResume() {
    setActionLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.resumeBulkMessaging(bulkMessagingId);

      toast.success("Bulk messaging resumed");
      setBulkMessaging((prev) => ({ ...prev, status: "processing" }));
      await loadProgressData();
    } catch (err) {
      setError("Failed to resume bulk messaging");
      toast.error("Failed to resume bulk messaging");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRetryFailed() {
    setActionLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.retryFailedMessages(bulkMessagingId);

      toast.success("Retrying failed messages");
      await loadBulkMessagingDetails();
    } catch (err) {
      setError("Failed to retry messages");
      toast.error("Failed to retry messages");
    } finally {
      setActionLoading(false);
    }
  }

  function handleRefresh() {
    loadBulkMessagingDetails();
    toast.success("Data refreshed");
  }

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
      case "processing":
      case "sent":
      case "delivered":
      case "read":
        return "default";
      case "completed":
        return "secondary";
      case "paused":
        return "outline";
      case "failed":
        return "destructive";
      case "queued":
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "read":
        return "text-green-600";
      case "delivered":
        return "text-blue-600";
      case "sent":
        return "text-primary";
      case "queued":
        return "text-muted-foreground";
      case "failed":
        return "text-destructive";
      default:
        return "";
    }
  }

  function calculateProgress() {
    if (!progress || progress.totalRecipients === 0) return 0;
    const processed = progress.sent + progress.delivered + progress.read + progress.failed;
    return Math.round((processed / progress.totalRecipients) * 100);
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="Bulk Messaging Details"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Bulk Messaging", path: "/whatsapp/bulk-messaging" },
            { label: "Details" },
          ]}
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!bulkMessaging) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="Bulk Messaging Not Found"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Bulk Messaging", path: "/whatsapp/bulk-messaging" },
          ]}
        />
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Bulk messaging not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/whatsapp/bulk-messaging")}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bulk Messaging
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const progressPercentage = calculateProgress();
  const hasRetryableFailures = failedMessages.some((msg) => msg.isRetryable);

  return (
    <section className="space-y-6">
      <Breadcrumb
        title={bulkMessaging.name}
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Bulk Messaging", path: "/whatsapp/bulk-messaging" },
          { label: bulkMessaging.name },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Header Card */}
      <Card className="industrial-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
                  {bulkMessaging.name}
                </h1>
                <Badge variant={getBadgeVariant(bulkMessaging.status)} className="uppercase text-xs">
                  {bulkMessaging.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Campaign: {bulkMessaging.campaignName}</p>
                <p>Template: {bulkMessaging.templateName}</p>
                <p>Created: {formatDate(bulkMessaging.createdAt)}</p>
                {bulkMessaging.startedAt && <p>Started: {formatDate(bulkMessaging.startedAt)}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="font-bold uppercase tracking-wider"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/whatsapp/bulk-messaging")}
                className="font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="industrial-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {bulkMessaging.status === "pending" && (
              <Button
                size="sm"
                onClick={handleStart}
                disabled={actionLoading}
                className="font-bold uppercase tracking-wider"
              >
                <Play className="w-4 h-4" /> Start
              </Button>
            )}
            {bulkMessaging.status === "processing" && (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePause}
                disabled={actionLoading}
                className="font-bold uppercase tracking-wider"
              >
                <Pause className="w-4 h-4" /> Pause
              </Button>
            )}
            {bulkMessaging.status === "paused" && (
              <Button
                size="sm"
                onClick={handleResume}
                disabled={actionLoading}
                className="font-bold uppercase tracking-wider"
              >
                <Play className="w-4 h-4" /> Resume
              </Button>
            )}
            {hasRetryableFailures && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetryFailed}
                disabled={actionLoading}
                className="font-bold uppercase tracking-wider"
              >
                <RotateCcw className="w-4 h-4" /> Retry Failed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {progress && (
        <Card className="industrial-card">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-xs">Overall Progress</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {progress.sent + progress.delivered + progress.read + progress.failed} of{" "}
              {progress.totalRecipients} processed
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Recipients"
            value={progress.totalRecipients}
            icon={Users}
            color="primary"
          />
          <StatCard title="Queued" value={progress.queued} icon={Clock} color="primary" />
          <StatCard title="Sent" value={progress.sent} icon={Send} color="primary" />
          <StatCard
            title="Delivered"
            value={progress.delivered}
            icon={CheckCircle}
            color="primary"
          />
          <StatCard title="Read" value={progress.read} icon={Eye} color="primary" />
          <StatCard title="Failed" value={progress.failed} icon={XCircle} color="primary" />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="messages" className="font-bold uppercase tracking-wider">
            Messages
          </TabsTrigger>
          <TabsTrigger value="failed" className="font-bold uppercase tracking-wider">
            Failed Messages
            {failedMessages.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {failedMessages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight">Recent Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Phone</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Status</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Sent At</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Delivered At
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Read At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No messages found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      messages.map((message, index) => (
                        <TableRow key={message._id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{message.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getBadgeVariant(message.status)}
                              className={`uppercase text-xs ${getStatusColor(message.status)}`}
                            >
                              {message.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(message.sentAt)}</TableCell>
                          <TableCell>{formatDate(message.deliveredAt)}</TableCell>
                          <TableCell>{formatDate(message.readAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Messages Tab */}
        <TabsContent value="failed" className="space-y-4">
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight">Failed Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Phone</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Error</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Error Code
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Failed At
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Retryable
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFailedMessages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No failed messages</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedFailedMessages.map((message, index) => (
                        <TableRow key={message._id}>
                          <TableCell className="font-medium">{failedStartIndex + index + 1}</TableCell>
                          <TableCell className="font-medium">{message.phone}</TableCell>
                          <TableCell className="text-sm">{message.error}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {message.errorCode}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(message.failedAt)}</TableCell>
                          <TableCell>
                            {message.isRetryable ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                                No
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {paginatedFailedMessages.length > 0 && (
                <div className="border-t">
                  <TablePagination
                    currentPage={failedCurrentPage}
                    totalPages={failedTotalPages}
                    pageSize={failedPageSize}
                    onPageChange={setFailedCurrentPage}
                    onPageSizeChange={setFailedPageSize}
                    pageSizeOptions={FAILED_PAGE_SIZE_OPTIONS}
                    totalItems={failedMessages.length}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
