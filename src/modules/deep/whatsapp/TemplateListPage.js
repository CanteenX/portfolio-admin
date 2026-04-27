/**
 * WhatsApp Template List Page
 *
 * Lists all WhatsApp templates with search, filtering by category and meta status.
 * Allows syncing templates from Meta, creating new templates, and managing existing ones.
 * Displays template name, meta template name, category, language, status, variables count, and actions.
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
import { usePagination } from "../../../hooks/usePagination";
import { useTableFilter } from "../../../hooks/useTableFilter";
import { useTableSort } from "../../../hooks/useTableSort";
import { AlertCircle, Plus, RefreshCw, Eye, Send, Trash2, FileText } from "lucide-react";

export function TemplateListPage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [submittingIds, setSubmittingIds] = useState(new Set());

  async function loadTemplates() {
    setError(null);
    setLoading(true);
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.listTemplates({
      //   match: searchTerm,
      //   category: categoryFilter || undefined,
      //   metaStatus: statusFilter || undefined,
      //   skip: 0,
      //   per_page: 1000,
      // });

      // Mock data for now
      const mockTemplates = [
        {
          _id: "tmpl1",
          name: "welcome_message",
          metaTemplateName: "welcome_message_v2",
          category: "MARKETING",
          language: "en",
          metaStatus: "APPROVED",
          bodyText: "Hello {{1}}! Welcome to {{2}}. We're excited to have you!",
          headerText: "Welcome",
          footerText: "Reply STOP to unsubscribe",
          variables: [
            { position: 1, description: "User name", sampleValue: "John", fieldMapping: "user.name" },
            { position: 2, description: "Company name", sampleValue: "Acme Corp", fieldMapping: "custom" },
          ],
          createdAt: "2024-03-15T10:00:00Z",
        },
        {
          _id: "tmpl2",
          name: "discount_offer",
          metaTemplateName: "discount_offer_spring",
          category: "MARKETING",
          language: "en",
          metaStatus: "APPROVED",
          bodyText: "Hi {{1}}! Get {{2}}% off on your next purchase. Valid until {{3}}.",
          headerText: "Special Offer",
          footerText: "Terms apply",
          variables: [
            { position: 1, description: "Customer name", sampleValue: "Jane", fieldMapping: "user.name" },
            { position: 2, description: "Discount percent", sampleValue: "20", fieldMapping: "custom" },
            { position: 3, description: "Expiry date", sampleValue: "March 31", fieldMapping: "custom" },
          ],
          createdAt: "2024-03-10T14:30:00Z",
        },
        {
          _id: "tmpl3",
          name: "appointment_reminder",
          metaTemplateName: "appointment_reminder",
          category: "UTILITY",
          language: "en",
          metaStatus: "PENDING",
          bodyText: "Dear {{1}}, this is a reminder for your appointment on {{2}} at {{3}}.",
          headerText: "",
          footerText: "Thank you",
          variables: [
            { position: 1, description: "Patient name", sampleValue: "Bob", fieldMapping: "user.name" },
            { position: 2, description: "Date", sampleValue: "April 20", fieldMapping: "custom" },
            { position: 3, description: "Time", sampleValue: "10:00 AM", fieldMapping: "custom" },
          ],
          createdAt: "2024-03-20T09:15:00Z",
        },
        {
          _id: "tmpl4",
          name: "order_confirmation",
          metaTemplateName: "order_confirmation_v1",
          category: "UTILITY",
          language: "en",
          metaStatus: "REJECTED",
          bodyText: "Order {{1}} confirmed. Total: ${{2}}. Delivery by {{3}}.",
          headerText: "Order Update",
          footerText: "",
          variables: [
            { position: 1, description: "Order ID", sampleValue: "12345", fieldMapping: "custom" },
            { position: 2, description: "Amount", sampleValue: "99.99", fieldMapping: "custom" },
            { position: 3, description: "Delivery date", sampleValue: "April 25", fieldMapping: "custom" },
          ],
          createdAt: "2024-03-18T16:00:00Z",
        },
        {
          _id: "tmpl5",
          name: "otp_verification",
          metaTemplateName: "otp_verification",
          category: "AUTHENTICATION",
          language: "en",
          metaStatus: "APPROVED",
          bodyText: "Your verification code is {{1}}. Valid for 5 minutes.",
          headerText: "",
          footerText: "",
          variables: [
            { position: 1, description: "OTP code", sampleValue: "123456", fieldMapping: "custom" },
          ],
          createdAt: "2024-03-12T11:20:00Z",
        },
      ];

      setTemplates(mockTemplates);
    } catch (err) {
      setError("Failed to load templates");
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, [api]);

  async function handleSyncFromMeta() {
    setSyncing(true);
    setError(null);

    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.syncFromMeta();

      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const syncedCount = Math.floor(Math.random() * 5) + 2;

      toast.success(`${syncedCount} templates synced from Meta`);
      await loadTemplates();
    } catch (err) {
      setError("Failed to sync templates from Meta");
      toast.error("Failed to sync templates from Meta");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSubmitToMeta(templateId) {
    setSubmittingIds((prev) => new Set(prev).add(templateId));
    setError(null);

    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.submitToMeta(templateId);

      toast.success("Template submitted to Meta for review");
      await loadTemplates();
    } catch (err) {
      setError("Failed to submit template to Meta");
      toast.error("Failed to submit template to Meta");
    } finally {
      setSubmittingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  }

  async function handleDelete(templateId) {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.deleteTemplate(templateId);

      toast.success("Template deleted successfully");
      await loadTemplates();
    } catch (err) {
      setError("Failed to delete template");
      toast.error("Failed to delete template");
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

  function getStatusBadgeVariant(status) {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "APPROVED":
        return "bg-green-600 text-white";
      case "PENDING":
        return "bg-yellow-600 text-white";
      case "REJECTED":
        return "bg-red-600 text-white";
      default:
        return "";
    }
  }

  // Filter by category
  const templatesWithCategoryFilter = templates.filter((template) => {
    if (!categoryFilter) return true;
    return template.category === categoryFilter;
  });

  // Filter by status
  const templatesWithStatusFilter = templatesWithCategoryFilter.filter((template) => {
    if (!statusFilter) return true;
    return template.metaStatus === statusFilter;
  });

  // Apply search filter
  const filteredTemplates = useTableFilter({
    data: templatesWithStatusFilter,
    searchTerm,
    searchFields: ["name", "metaTemplateName", "language"],
  });

  // Apply sorting
  const { sortedData, sortKey, sortDirection, toggleSort: handleSort } = useTableSort({ data: filteredTemplates });

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
          title="WhatsApp Templates"
          items={[{ label: "Home", path: "/" }, { label: "WhatsApp" }, { label: "Templates" }]}
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
        title="WhatsApp Templates"
        items={[{ label: "Home", path: "/" }, { label: "WhatsApp" }, { label: "Templates" }]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card className="industrial-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex-1 min-w-[240px] max-w-md">
              <TableSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search templates..."
                filters={[
                  {
                    key: "category",
                    type: "select",
                    value: categoryFilter,
                    onChange: setCategoryFilter,
                    placeholder: "Filter by category",
                    allLabel: "All Categories",
                    options: [
                      { value: "MARKETING", label: "Marketing" },
                      { value: "UTILITY", label: "Utility" },
                      { value: "AUTHENTICATION", label: "Authentication" },
                    ],
                  },
                  {
                    key: "status",
                    type: "select",
                    value: statusFilter,
                    onChange: setStatusFilter,
                    placeholder: "Filter by status",
                    allLabel: "All Statuses",
                    options: [
                      { value: "APPROVED", label: "Approved" },
                      { value: "PENDING", label: "Pending" },
                      { value: "REJECTED", label: "Rejected" },
                    ],
                  },
                ]}
                onClear={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setStatusFilter("");
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSyncFromMeta}
                disabled={syncing}
                className="font-bold uppercase tracking-wider"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync from Meta"}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/whatsapp/templates/create")}
                className="font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Create Template
              </Button>
            </div>
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
                      label="Template Name"
                      sortKey="name"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Meta Template Name"
                      sortKey="metaTemplateName"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Category"
                      sortKey="category"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Language"
                      sortKey="language"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Meta Status"
                      sortKey="metaStatus"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold">Variables</TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No templates found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((template, index) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell className="text-muted-foreground">{template.metaTemplateName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-xs">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="uppercase text-xs font-medium">{template.language}</TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-xs ${getStatusColor(template.metaStatus)}`}>
                          {template.metaStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {template.variables?.length || 0} vars
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/whatsapp/templates/${template._id}`)}
                            title="View/Edit Template"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {template.metaStatus !== "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubmitToMeta(template._id)}
                              disabled={submittingIds.has(template._id)}
                              title="Submit to Meta"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template._id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Template"
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
