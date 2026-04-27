import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { usePermission } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pencil, Trash2, Plus, Loader2, ChevronRight, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

export default function MenuMasterPage() {
  const { api } = useAuth();

  const canCreate = usePermission("/rbac/menus", "CREATE");
  const canUpdate = usePermission("/rbac/menus", "UPDATE");
  const canDelete = usePermission("/rbac/menus", "DELETE");

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [form, setForm] = useState({
    menuName: "", isRoot: true, parentMenu: null, menuUrl: "", sequence: 0, icon: "", isActive: true,
  });

  const loadMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const res = await api.get("/api/v1/rbac/menus", { params });
      setMenus(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menus");
    } finally {
      setLoading(false);
    }
  }, [api, debouncedSearch]);

  useEffect(() => { loadMenus(); }, [loadMenus]);

  const resetForm = () => {
    setForm({ menuName: "", isRoot: true, parentMenu: null, menuUrl: "", sequence: 0, icon: "", isActive: true });
    setSelected(null);
  };

  const openCreate = () => { resetForm(); setIsDialogOpen(true); };

  const openEdit = (menu) => {
    setSelected(menu);
    setForm({
      menuName: menu.menuName,
      isRoot: menu.isRoot,
      parentMenu: menu.parentMenu ?? null,
      menuUrl: menu.menuUrl,
      sequence: menu.sequence,
      icon: menu.icon || "",
      isActive: menu.isActive,
    });
    setIsDialogOpen(true);
  };

  const openDelete = (menu) => { setSelected(menu); setIsDeleteOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const payload = { ...form, parentMenu: form.isRoot ? null : form.parentMenu };
      if (selected) {
        await api.put(`/api/v1/rbac/menus/${selected._id}`, payload);
      } else {
        await api.post("/api/v1/rbac/menus", payload);
      }
      await loadMenus();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save menu");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/api/v1/rbac/menus/${selected._id}`);
      await loadMenus();
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete menu");
    } finally {
      setFormLoading(false);
    }
  };

  const rootMenus = menus.filter((m) => m.isRoot);
  const subMenusFor = (parentId) => menus.filter((m) => !m.isRoot && m.parentMenu === parentId);
  const showActions = canUpdate || canDelete;

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Menu Management (RBAC)"
        items={[{ label: "Home", path: "/" }, { label: "RBAC" }, { label: "Menus" }]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-bold uppercase tracking-wider">Menu Master</CardTitle>
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button size="sm" onClick={openCreate} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> New Menu
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menus..."
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
                    <TableHead className="font-bold uppercase tracking-wider">Menu Name</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">URL</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">Type</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider w-16">Seq</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider w-24">Status</TableHead>
                    {showActions && (
                      <TableHead className="w-24 font-bold uppercase tracking-wider">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rootMenus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showActions ? 6 : 5} className="text-center py-12 text-muted-foreground">
                        No menus found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rootMenus
                      .sort((a, b) => a.sequence - b.sequence)
                      .flatMap((root) => [
                        <TableRow key={root._id}>
                          <TableCell className="font-semibold">{root.menuName}</TableCell>
                          <TableCell className="text-muted-foreground text-sm font-mono">{root.menuUrl}</TableCell>
                          <TableCell><Badge variant="default" className="rounded-sm">Root</Badge></TableCell>
                          <TableCell>{root.sequence}</TableCell>
                          <TableCell>
                            <Badge variant={root.isActive ? "secondary" : "outline"} className="rounded-sm">
                              {root.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          {showActions && (
                            <TableCell>
                              <div className="flex gap-1">
                                {canUpdate && (
                                  <Button variant="ghost" size="sm" onClick={() => openEdit(root)} className="h-8 w-8 p-0 rounded-sm">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button variant="ghost" size="sm" onClick={() => openDelete(root)} className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>,
                        ...subMenusFor(root._id)
                          .sort((a, b) => a.sequence - b.sequence)
                          .map((sub) => (
                            <TableRow key={sub._id} className="bg-muted/20">
                              <TableCell className="pl-8">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <ChevronRight className="h-3 w-3" /> {sub.menuName}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm font-mono">{sub.menuUrl}</TableCell>
                              <TableCell><Badge variant="outline" className="rounded-sm">Sub</Badge></TableCell>
                              <TableCell>{sub.sequence}</TableCell>
                              <TableCell>
                                <Badge variant={sub.isActive ? "secondary" : "outline"} className="rounded-sm">
                                  {sub.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              {showActions && (
                                <TableCell>
                                  <div className="flex gap-1">
                                    {canUpdate && (
                                      <Button variant="ghost" size="sm" onClick={() => openEdit(sub)} className="h-8 w-8 p-0 rounded-sm">
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canDelete && (
                                      <Button variant="ghost" size="sm" onClick={() => openDelete(sub)} className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          )),
                      ])
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-sm max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              {selected ? "Edit Menu" : "Create Menu"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Menu Name</Label>
                  <Input value={form.menuName} onChange={(e) => setForm((p) => ({ ...p, menuName: e.target.value }))} required className="rounded-sm" placeholder="e.g. Employees" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Menu URL</Label>
                  <Input value={form.menuUrl} onChange={(e) => setForm((p) => ({ ...p, menuUrl: e.target.value }))} required className="rounded-sm font-mono text-sm" placeholder="/admin/employees" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Icon (Lucide name)</Label>
                  <Input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} className="rounded-sm" placeholder="e.g. Users" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Sequence</Label>
                  <Input type="number" value={form.sequence} onChange={(e) => setForm((p) => ({ ...p, sequence: parseInt(e.target.value) || 0 }))} className="rounded-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-sm border px-4 py-3">
                <Label className="font-bold uppercase tracking-wider text-xs">Is Root Menu</Label>
                <Switch checked={form.isRoot} onCheckedChange={(v) => setForm((p) => ({ ...p, isRoot: v, parentMenu: v ? null : p.parentMenu }))} />
              </div>
              {!form.isRoot && (
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Parent Menu</Label>
                  <Select value={form.parentMenu ?? ""} onValueChange={(v) => setForm((p) => ({ ...p, parentMenu: v }))}>
                    <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select parent" /></SelectTrigger>
                    <SelectContent className="rounded-sm">
                      {rootMenus.map((m) => (
                        <SelectItem key={m._id} value={m._id}>{m.menuName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
        title="Delete Menu"
        description={`Delete "${selected?.menuName}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
