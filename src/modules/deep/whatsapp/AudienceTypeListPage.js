/**
 * Audience Type List Page
 *
 * Lists all saved audience segments/types for WhatsApp campaigns.
 * These segments define reusable filters for targeting specific user groups.
 * Users can create, edit, or delete audience segments.
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
import { AlertCircle, Plus, Users, Edit, Trash2, Eye } from "lucide-react";

export function AudienceTypeListPage() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [audienceTypes, setAudienceTypes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadAudienceTypes() {
    setError(null);
    try {
      // TODO: Replace with actual SDK call when implemented
      // const result = await api.whatsapp.listAudienceTypes({ skip: 0, per_page: 1000 });

      // Mock data for now
      const mockAudienceTypes = [
        {
          _id: "1",
          name: "Premium Business Users",
          description: "Business users with premium subscription",
          filterCriteria: {
            userTypes: ["business"],
            verifiedOnly: true,
            premiumOnly: true,
          },
          createdBy: "Admin",
          createdAt: "2024-03-15T10:00:00Z",
        },
        {
          _id: "2",
          name: "Mumbai Personal Users",
          description: "Personal users located in Mumbai",
          filterCriteria: {
            userTypes: ["personal"],
            cities: ["Mumbai"],
          },
          createdBy: "Admin",
          createdAt: "2024-03-10T14:30:00Z",
        },
        {
          _id: "3",
          name: "New Registrations Last 30 Days",
          description: "Users who registered in the last 30 days",
          filterCriteria: {
            registeredAfter: "2024-02-15T00:00:00Z",
          },
          createdBy: "Admin",
          createdAt: "2024-03-20T09:15:00Z",
        },
        {
          _id: "4",
          name: "Tech Companies in Bangalore",
          description: "Company users in tech industry based in Bangalore",
          filterCriteria: {
            userTypes: ["company"],
            cities: ["Bangalore"],
            industries: ["Technology", "IT Services"],
          },
          createdBy: "Admin",
          createdAt: "2024-03-18T16:00:00Z",
        },
      ];

      setAudienceTypes(mockAudienceTypes);
    } catch (err) {
      setError("Failed to load audience types");
      toast.error("Failed to load audience types");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudienceTypes();
  }, [api]);

  async function handleDelete(audienceTypeId) {
    if (
      !window.confirm(
        "Are you sure you want to delete this audience segment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.deleteAudienceType(audienceTypeId);

      toast.success("Audience segment deleted successfully");
      await loadAudienceTypes();
    } catch (err) {
      setError("Failed to delete audience segment");
      toast.error("Failed to delete audience segment");
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

  function formatFilterCriteria(criteria) {
    if (!criteria) return "-";
    const jsonString = JSON.stringify(criteria, null, 2);
    return jsonString.length > 50 ? jsonString.substring(0, 50) + "..." : jsonString;
  }

  // Apply search filter
  const filteredAudienceTypes = useTableFilter({
    data: audienceTypes,
    searchTerm,
    searchFields: ["name", "description", "createdBy"],
  });

  // Apply sorting
  const { sortedData, sortKey, sortDirection, toggleSort: handleSort } = useTableSort({
    data: filteredAudienceTypes,
    initialSortKey: "createdAt",
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
          title="Audience Segments"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Audience Segments" },
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
        title="Audience Segments"
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Audience Segments" },
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
                placeholder="Search audience segments..."
                onClear={() => setSearchTerm("")}
              />
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/whatsapp/audience-types/create")}
              className="font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Create Audience Segment
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
                      label="Segment Name"
                      sortKey="name"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Description"
                      sortKey="description"
                      currentSortKey={sortKey}
                      currentSortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableHead>
                  <TableHead className="uppercase tracking-wider text-xs font-bold">
                    Filter Criteria
                  </TableHead>
                  <TableHead>
                    <SortableHeader
                      label="Created By"
                      sortKey="createdBy"
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
                  <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No audience segments found</p>
                      {searchTerm && <p className="text-xs mt-1">Try adjusting your search</p>}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((audienceType, index) => (
                    <TableRow key={audienceType._id}>
                      <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">{audienceType.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                        {audienceType.description || "-"}
                      </TableCell>
                      <TableCell>
                        <pre className="text-xs font-mono bg-muted/50 p-2 rounded border max-w-[250px] overflow-hidden">
                          {formatFilterCriteria(audienceType.filterCriteria)}
                        </pre>
                      </TableCell>
                      <TableCell>{audienceType.createdBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(audienceType.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/whatsapp/audience-types/${audienceType._id}/edit`)
                            }
                            title="Edit Segment"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(audienceType._id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Segment"
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
