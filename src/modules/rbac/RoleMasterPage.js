import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pencil, Trash2, Plus, Loader2, Search } from "lucide-react";

export default function RoleMasterPage() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const { write: canCreate, edit: canUpdate, delete: canDelete } = useRbacPagePermissions();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const res = await api.get("/api/v1/rbac/roles", { params });
      setRoles(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [api, debouncedSearch]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const openDelete = (role) => { setSelected(role); setIsDeleteOpen(true); };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/api/v1/rbac/roles/${selected._id}`);
      await loadRoles();
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete role");
    } finally {
      setDeleteLoading(false);
    }
  };

  const grantedCount = (role) => role.permissions?.filter((p) => p.granted).length ?? 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Role Management"
        items={[{ label: "Home", path: "/" }, { label: "RBAC" }, { label: "Roles" }]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-bold uppercase tracking-wider">Role Master</CardTitle>
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button size="sm" onClick={() => navigate("/rbac/roles/new")} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> New Role
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="rounded-sm pl-8 w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold uppercase tracking-wider">Role Name</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">Permissions</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider w-28">Status</TableHead>
                    {(canUpdate || canDelete) && (
                      <TableHead className="w-24 font-bold uppercase tracking-wider">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        No roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-semibold">{role.roleName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-sm">
                            {grantedCount(role)} granted
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.isActive ? "secondary" : "outline"} className="rounded-sm">
                            {role.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {(canUpdate || canDelete) && (
                          <TableCell>
                            <div className="flex gap-1">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/rbac/roles/${role._id}/edit`, { state: { role } })}
                                  className="h-8 w-8 p-0 rounded-sm"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDelete(role)}
                                  className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Role"
        description={`Delete role "${selected?.roleName}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  );
}
