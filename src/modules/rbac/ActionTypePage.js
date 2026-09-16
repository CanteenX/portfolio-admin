import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pencil, Trash2, Plus, Loader2, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

export default function ActionTypePage() {
  const { api, session } = useAuth();
  const isSuperAdmin = session?.user?.role === "super_admin";

  // The server's action vocabulary is lowercase read/write/edit/delete. Asking
  // for "CREATE" matched nothing, so every button here was hidden from every
  // non-super-admin — a permissions bug that looked like a missing grant.
  const { write: canCreate, edit: canUpdate, delete: canDelete } = useRbacPagePermissions();

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [form, setForm] = useState({ actionName: "", actionCode: "", isActive: true });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const res = await api.get("/api/v1/rbac/actions", { params });
      setActions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load action types");
    } finally {
      setLoading(false);
    }
  }, [api, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ actionName: "", actionCode: "", isActive: true }); setSelected(null); };
  const openCreate = () => { resetForm(); setIsDialogOpen(true); };
  const openEdit = (a) => {
    setSelected(a);
    setForm({ actionName: a.actionName, actionCode: a.actionCode, isActive: a.isActive });
    setIsDialogOpen(true);
  };
  const openDelete = (a) => { setSelected(a); setIsDeleteOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      if (selected) {
        await api.put(`/api/v1/rbac/actions/${selected._id}`, form);
      } else {
        await api.post("/api/v1/rbac/actions", form);
      }
      await load();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save action type");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/api/v1/rbac/actions/${selected._id}`);
      await load();
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete action type");
    } finally {
      setFormLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <Breadcrumb title="Action Types" items={[{ label: "Home", path: "/" }, { label: "RBAC" }, { label: "Action Types" }]} />
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
          Access denied. Super Admin only.
        </div>
      </div>
    );
  }

  const showActions = canUpdate || canDelete;

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Action Type Management"
        items={[{ label: "Home", path: "/" }, { label: "RBAC" }, { label: "Action Types" }]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">{error}</div>
      )}

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-bold uppercase tracking-wider">Action Types</CardTitle>
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button size="sm" onClick={openCreate} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> New Action Type
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions..."
                className="rounded-sm pl-8 w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold uppercase tracking-wider">Action Name</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">Action Code</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider w-24">Status</TableHead>
                    {showActions && <TableHead className="w-24 font-bold uppercase tracking-wider">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showActions ? 4 : 3} className="text-center py-12 text-muted-foreground">No action types found</TableCell>
                    </TableRow>
                  ) : (
                    actions.map((a) => (
                      <TableRow key={a._id}>
                        <TableCell className="font-medium">{a.actionName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-sm font-mono">{a.actionCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.isActive ? "secondary" : "outline"} className="rounded-sm">
                            {a.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {showActions && (
                          <TableCell>
                            <div className="flex gap-1">
                              {canUpdate && (
                                <Button variant="ghost" size="sm" onClick={() => openEdit(a)} className="h-8 w-8 p-0 rounded-sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button variant="ghost" size="sm" onClick={() => openDelete(a)} className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-sm max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              {selected ? "Edit Action Type" : "Create Action Type"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-wider text-xs">Action Name</Label>
                <Input value={form.actionName} onChange={(e) => setForm((p) => ({ ...p, actionName: e.target.value }))} required className="rounded-sm" placeholder="e.g. Read Data" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-wider text-xs">Action Code</Label>
                <Input value={form.actionCode} onChange={(e) => setForm((p) => ({ ...p, actionCode: e.target.value.toUpperCase() }))} required className="rounded-sm font-mono" placeholder="e.g. READ" />
                <p className="text-xs text-muted-foreground">Used as the permission key in roles. Convention: uppercase (READ, CREATE, UPDATE, DELETE).</p>
              </div>
              <div className="flex items-center justify-between rounded-sm border px-4 py-3">
                <Label className="font-bold uppercase tracking-wider text-xs">Active</Label>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={formLoading} className="rounded-sm">
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selected ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Action Type"
        description={`Delete action type "${selected?.actionName}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
