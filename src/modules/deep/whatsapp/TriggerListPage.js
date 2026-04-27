/**
 * Trigger List Page
 *
 * Lists all WhatsApp event triggers with search, filtering, and pagination.
 * Triggers automatically send WhatsApp messages when specific events occur.
 * Users can toggle activation status, edit, or delete triggers inline.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TablePagination } from "../../../components/common/TablePagination";
import { TableSearch } from "../../../components/common/TableSearch";
import { SortableHeader } from "../../../components/common/SortableHeader";
import { usePagination } from "../../../hooks/usePagination";
import { useTableFilter } from "../../../hooks/useTableFilter";
import { useTableSort } from "../../../hooks/useTableSort";
import { AlertCircle, Plus, Zap, Edit, Trash2 } from "lucide-react";

export function TriggerListPage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [triggers, setTriggers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingTrigger, setTogglingTrigger] = useState(null);

  async function loadTriggers() {
    setError(null);
    try {
      // TODO: Replace with actual SDK call when implemented
      // const result = await api.whatsapp.listTriggers({ match: searchTerm, skip: 0, per_page: 1000 });

      // Mock data for now
      const mockTriggers = [
        {
          _id: "1",
          eventKey: "CONNECTION_REQUEST_SENT",
          displayName: "Connection Request Sent",
          templateName: "connection_request_notification",
          isActive: true,
          updatedAt: "2024-03-15T10:00:00Z",
        },
        {
          _id: "2",
          eventKey: "CONNECTION_ACCEPTED",
          displayName: "Connection Accepted",
          templateName: "connection_accepted_message",
          isActive: true,
          updatedAt: "2024-03-10T14:30:00Z",
        },
        {
          _id: "3",
          eventKey: "PROFILE_COMPLETED",
          displayName: "Profile Completed",
          templateName: "profile_completion_welcome",
          isActive: false,
          updatedAt: "2024-03-20T09:15:00Z",
        },
        {
          _id: "4",
          eventKey: "MESSAGE_RECEIVED",
          displayName: "New Message Received",
          templateName: "new_message_alert",
          isActive: true,
          updatedAt: "2024-03-18T16:00:00Z",
        },
      ];

      setTriggers(mockTriggers);
    } catch (err) {
      setError("Failed to load triggers");
      toast.error("Failed to load triggers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTriggers();
  }, [api]);

  async function handleToggleActive(triggerId, currentStatus) {
    setTogglingTrigger(triggerId);
    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.updateTrigger(triggerId, { isActive: !currentStatus });

      // Update local state
      setTriggers((prev) =>
        prev.map((t) =>
          t._id === triggerId ? { ...t, isActive: !currentStatus } : t
        )
      );

      toast.success(`Trigger ${!currentStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      setError("Failed to toggle trigger status");
      toast.error("Failed to toggle trigger status");
    } finally {
      setTogglingTrigger(null);
    }
  }

  async function handleDelete(triggerId) {
    if (!window.confirm("Are you sure you want to delete this trigger? This action cannot be undone.")) {
      return;
    }

    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.deleteTrigger(triggerId);

      toast.success("Trigger deleted successfully");
      await loadTriggers();
    } catch (err) {
      setError("Failed to delete trigger");
      toast.error("Failed to delete trigger");
    }
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

  // Apply search filter
  const filteredTriggers = useTableFilter({
    data: triggers,
    searchTerm,
    searchFields: ["eventKey", "displayName", "templateName"],
  });

  // Apply sorting
  const { sortedData, sortKey, sortDirection, toggleSort: handleSort } = useTableSort({
    data: filteredTriggers,
    initialSortKey: "updatedAt",
    initialSortDirection: "desc",
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

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="WhatsApp Triggers"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Triggers" },
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
        title="WhatsApp Triggers"
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Triggers" },
        ]}
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
                placeholder="Search triggers by event, name, or template..."
                onClear={() => setSearchTerm("")}
              />
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/whatsapp/triggers/create")}
              className="font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Create Trigger
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
                      label="Event Key"
                      sortKey="eventKey"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Display Name"
                      sortKey="displayName"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
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
                      label="Active"
                      sortKey="isActive"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Last Modified"
                      sortKey="updatedAt"
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No triggers found</p>
                      {searchTerm && <p className="text-xs mt-1">Try adjusting your search</p>}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((trigger, index) => (
                    <TableRow key={trigger._id}>
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="uppercase text-xs font-mono bg-blue-600">
                          {trigger.eventKey}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{trigger.displayName}</TableCell>
                      <TableCell className="font-mono text-sm">{trigger.templateName}</TableCell>
                      <TableCell>
                        <Switch
                          checked={trigger.isActive}
                          onCheckedChange={() => handleToggleActive(trigger._id, trigger.isActive)}
                          disabled={togglingTrigger === trigger._id}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(trigger.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/whatsapp/triggers/${trigger._id}/edit`)}
                            title="Edit Trigger"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(trigger._id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Trigger"
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
