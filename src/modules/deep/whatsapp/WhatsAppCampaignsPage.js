/**
 * WhatsApp Campaigns Page
 *
 * Lists all WhatsApp marketing campaigns with search, filtering, and pagination.
 * Displays KPIs for total campaigns, active campaigns, sent messages, and delivered messages.
 * Allows users to create, view, edit, and delete campaigns.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TablePagination } from "../../../components/common/TablePagination";
import { TableSearch } from "../../../components/common/TableSearch";
import { SortableHeader } from "../../../components/common/SortableHeader";
import { StatCard } from "../../../components/dashboard/StatCard";
import { usePagination } from "../../../hooks/usePagination";
import { useTableFilter } from "../../../hooks/useTableFilter";
import { useTableSort } from "../../../hooks/useTableSort";
import { AlertCircle, Plus, MessageCircle, Activity, Send, CheckCircle, Eye, Edit, Trash2 } from "lucide-react";

export function WhatsAppCampaignsPage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function loadCampaigns() {
    setError(null);
    try {
      // TODO: Replace with actual SDK call when implemented
      // const result = await api.whatsapp.listCampaigns();

      // Mock data for now
      const mockCampaigns = [
        {
          _id: "1",
          name: "Spring Sale 2024",
          status: "active",
          createdAt: "2024-03-15T10:00:00Z",
          totalSent: 1250,
          delivered: 1180,
        },
        {
          _id: "2",
          name: "Product Launch Announcement",
          status: "completed",
          createdAt: "2024-03-10T14:30:00Z",
          totalSent: 3420,
          delivered: 3280,
        },
        {
          _id: "3",
          name: "Customer Feedback Survey",
          status: "draft",
          createdAt: "2024-03-20T09:15:00Z",
          totalSent: 0,
          delivered: 0,
        },
        {
          _id: "4",
          name: "Weekend Flash Sale",
          status: "active",
          createdAt: "2024-03-18T16:00:00Z",
          totalSent: 890,
          delivered: 855,
        },
      ];

      const mockInsights = {
        totalCampaigns: 4,
        activeCampaigns: 2,
        totalSent: 5560,
        totalDelivered: 5315,
      };

      setCampaigns(mockCampaigns);
      setInsights(mockInsights);
    } catch (err) {
      setError("Failed to load campaigns");
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [api]);

  async function handleDelete(campaignId) {
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.deleteCampaign(campaignId);

      toast.success("Campaign deleted successfully");
      await loadCampaigns();
    } catch (err) {
      setError("Failed to delete campaign");
      toast.error("Failed to delete campaign");
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  }

  function getBadgeVariant(status) {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "secondary";
    }
  }

  // Filter by status
  const campaignsWithStatusFilter = campaigns.filter((campaign) => {
    if (!statusFilter) return true;
    return campaign.status === statusFilter;
  });

  // Apply search filter
  const filteredCampaigns = useTableFilter({
    data: campaignsWithStatusFilter,
    searchTerm,
    searchFields: ["name", "status"],
  });

  // Apply sorting
  const { sortedData, sortKey, sortDirection, toggleSort: handleSort } = useTableSort({ data: filteredCampaigns });

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

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="WhatsApp Campaigns"
          items={[{ label: "Home", path: "/" }, { label: "WhatsApp" }, { label: "Campaigns" }]}
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
        title="WhatsApp Campaigns"
        items={[{ label: "Home", path: "/" }, { label: "WhatsApp" }, { label: "Campaigns" }]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Campaigns"
            value={insights.totalCampaigns}
            icon={MessageCircle}
            color="primary"
          />
          <StatCard
            title="Active Campaigns"
            value={insights.activeCampaigns}
            icon={Activity}
            color="primary"
          />
          <StatCard
            title="Messages Sent"
            value={insights.totalSent}
            icon={Send}
            color="primary"
          />
          <StatCard
            title="Messages Delivered"
            value={insights.totalDelivered}
            icon={CheckCircle}
            color="primary"
          />
        </div>
      )}

      <Card className="industrial-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex-1 min-w-[240px] max-w-md">
              <TableSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search campaigns..."
                filters={[
                  {
                    key: "status",
                    type: "select",
                    value: statusFilter,
                    onChange: setStatusFilter,
                    placeholder: "Filter by status",
                    allLabel: "All Statuses",
                    options: [
                      { value: "active", label: "Active" },
                      { value: "completed", label: "Completed" },
                      { value: "draft", label: "Draft" },
                    ],
                  },
                ]}
                onClear={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                }}
              />
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/whatsapp/campaigns/create")}
              className="font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Campaign Name"
                      sortKey="name"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Status"
                      sortKey="status"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Created Date"
                      sortKey="createdAt"
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
                  <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No campaigns found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((campaign, index) => (
                    <TableRow key={campaign._id}>
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(campaign.status)} className="uppercase text-xs">
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell className="font-medium">{campaign.totalSent.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/whatsapp/campaigns/${campaign._id}`)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/whatsapp/campaigns/${campaign._id}/edit`)}
                            title="Edit Campaign"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(campaign._id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
    </section>
  );
}
