import { useState, useEffect } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCustomRoles,
} from "../../shared/sdk/system";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { TableSearch } from "../../components/common/TableSearch";
import { TablePagination } from "../../components/common/TablePagination";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { SortableHeader } from "../../components/common/SortableHeader";
import { usePagination } from "../../hooks/usePagination";
import { useTableFilter } from "../../hooks/useTableFilter";
import { useTableSort } from "../../hooks/useTableSort";
import { exportToExcel } from "../../lib/exportToExcel";
import { Pencil, Trash2, Download, Plus, Loader2 } from "lucide-react";

export default function UserManagementPage() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch users and custom roles
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, rolesData] = await Promise.all([
        getUsers(api),
        getCustomRoles(api),
      ]);
      setUsers(usersData);
      setCustomRoles(rolesData);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Table filtering and sorting
  const { filteredData, searchTerm, setSearchTerm, filters, setFilter } =
    useTableFilter(users, {
      searchFields: ["email", "role"],
      exactFilters: { role: "" },
    });

  const { sortedData, sortKey, sortDirection, handleSort } =
    useTableSort(filteredData);

  const {
    paginatedData,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    startIndex,
    PAGE_SIZE_OPTIONS,
  } = usePagination(sortedData, 10);

  // Calculate stats
  const stats = {
    total: users.length,
    superAdmins: users.filter((u) => u.role === "super_admin").length,
    admins: users.filter((u) => u.role === "admin").length,
    withCustomRoles: users.filter((u) => u.customRoleId).length,
  };

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      await createUser(api, {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      await loadData();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const updateData = {
        email: formData.email,
        role: formData.role,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUser(api, selectedUser._id, updateData);
      await loadData();
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    setFormLoading(true);
    setError(null);

    try {
      await deleteUser(api, selectedUser._id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    const exportData = sortedData.map((user) => ({
      email: user.email,
      role: user.role,
      customRole: user.customRoleId
        ? customRoles.find((r) => r.id === user.customRoleId)?.name || "N/A"
        : "N/A",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      updatedAt: new Date(user.updatedAt).toLocaleDateString(),
    }));

    exportToExcel({
      data: exportData,
      columns: [
        { header: "Email", key: "email" },
        { header: "Role", key: "role" },
        { header: "Custom Role", key: "customRole" },
        { header: "Created", key: "createdAt" },
        { header: "Updated", key: "updatedAt" },
      ],
      fileName: "users",
    });
  };

  // Open edit dialog
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      role: "admin",
    });
    setSelectedUser(null);
  };

  // Get custom role name by ID
  const getCustomRoleName = (customRoleId) => {
    const role = customRoles.find((r) => r.id === customRoleId);
    return role ? role.name : "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        title="User Management"
        items={[
          { label: "Home", path: "/" },
          { label: "Settings", path: "/settings/system" },
          { label: "Users" },
        ]}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Super Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.superAdmins}</div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              With Custom Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.withCustomRoles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="rounded-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex-1 max-w-md">
                <TableSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search users by email or role..."
                />
              </div>
              <Select
                value={filters.role || "all"}
                onValueChange={(value) =>
                  setFilter("role", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-sm">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={loading || sortedData.length === 0}
                className="rounded-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}
                className="rounded-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Users Table */}
              <div className="rounded-sm border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 font-bold uppercase tracking-wider">
                        #
                      </TableHead>
                      <SortableHeader
                        label="Email"
                        sortKey="email"
                        currentSortKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Role"
                        sortKey="role"
                        currentSortKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHead className="font-bold uppercase tracking-wider">
                        Custom Role
                      </TableHead>
                      <SortableHeader
                        label="Created"
                        sortKey="createdAt"
                        currentSortKey={sortKey}
                        direction={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHead className="w-24 font-bold uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((user, index) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "super_admin"
                                  ? "destructive"
                                  : "default"
                              }
                              className="rounded-sm"
                            >
                              {user.role === "super_admin"
                                ? "Super Admin"
                                : "Admin"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.customRoleId ? (
                              <Badge variant="outline" className="rounded-sm">
                                {getCustomRoleName(user.customRoleId)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="h-8 w-8 p-0 rounded-sm"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(user)}
                                className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {paginatedData.length > 0 && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    totalItems={sortedData.length}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              Create New User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="create-email"
                  className="font-bold uppercase tracking-wider text-sm"
                >
                  Email
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="rounded-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="create-password"
                  className="font-bold uppercase tracking-wider text-sm"
                >
                  Password
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="rounded-sm"
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="create-role"
                  className="font-bold uppercase tracking-wider text-sm"
                >
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="create-role" className="rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={formLoading}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="rounded-sm"
              >
                {formLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              Edit User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-email"
                  className="font-bold uppercase tracking-wider text-sm"
                >
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="rounded-sm"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-password"
                  className="font-bold uppercase tracking-wider text-sm"
                >
                  Password
                  <span className="text-muted-foreground ml-2 normal-case font-normal">
                    (leave blank to keep current)
                  </span>
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="rounded-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-role"
                  className="font-bold uppercase tracking-wider text-sm"
                >
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="edit-role" className="rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={formLoading}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="rounded-sm"
              >
                {formLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete the user "${selectedUser?.email}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
