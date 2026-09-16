import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
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
import { Pencil, Trash2, Plus, Loader2, ChevronRight, Search, FolderOpen, Link } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

// ── Tree helpers ──────────────────────────────────────────────────────────────

/**
 * Flatten all menus into depth-ordered rows for table rendering.
 * Returns [ { menu, depth }, ... ] in tree order.
 */
function flattenTree(menus) {
  const result = [];
  function visit(parentId, depth) {
    const children = menus
      .filter((m) => {
        const mp = m.parentMenu?._id ?? m.parentMenu ?? null;
        return (mp ? String(mp) : null) === (parentId ? String(parentId) : null);
      })
      .sort((a, b) => a.sequence - b.sequence);
    for (const child of children) {
      result.push({ menu: child, depth });
      visit(child._id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}

/**
 * Build the display path for a menu: "Root → Parent → Name"
 */
function buildPath(menuId, allMenus) {
  const parts = [];
  let current = allMenus.find((m) => String(m._id) === String(menuId));
  while (current) {
    parts.unshift(current.menuName);
    const parentId = current.parentMenu?._id ?? current.parentMenu ?? null;
    if (parentId) {
      current = allMenus.find((m) => String(m._id) === String(parentId));
    } else {
      break;
    }
  }
  return parts.join(" → ");
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MenuMasterPage() {
  const { api } = useAuth();

  const { write: canCreate, edit: canUpdate, delete: canDelete } = useRbacPagePermissions();

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
    menuName: "",
    isParentMenu: false,
    parentMenu: null,
    menuUrl: "",
    sequence: 0,
    icon: "",
    isActive: true,
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
    setForm({ menuName: "", isParentMenu: false, parentMenu: null, menuUrl: "", sequence: 0, icon: "", isActive: true });
    setSelected(null);
  };

  const openCreate = () => { resetForm(); setIsDialogOpen(true); };

  const openEdit = (menu) => {
    setSelected(menu);
    const parentId = menu.parentMenu?._id ?? menu.parentMenu ?? null;
    setForm({
      menuName: menu.menuName,
      isParentMenu: menu.isParentMenu ?? false,
      parentMenu: parentId ? String(parentId) : null,
      menuUrl: menu.menuUrl ?? "",
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
      const payload = {
        ...form,
        parentMenu: form.parentMenu || null,
      };
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

  // All menus that are parent menus (dropdowns), excluding the one being edited
  const parentCandidates = menus.filter(
    (m) => m.isParentMenu && (!selected || String(m._id) !== String(selected._id))
  );

  const treeRows = flattenTree(menus);
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
                  {treeRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showActions ? 6 : 5} className="text-center py-12 text-muted-foreground">
                        No menus found
                      </TableCell>
                    </TableRow>
                  ) : (
                    treeRows.map(({ menu, depth }) => (
                      <TableRow
                        key={menu._id}
                        className={depth > 0 ? "bg-muted/10 hover:bg-muted/20" : "hover:bg-muted/10"}
                      >
                        <TableCell>
                          <span
                            className="flex items-center gap-1"
                            style={{ paddingLeft: `${depth * 20}px` }}
                          >
                            {depth > 0 && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            {menu.isParentMenu ? (
                              <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <Link className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            )}
                            <span className={depth === 0 ? "font-semibold" : "text-muted-foreground"}>
                              {menu.menuName}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {menu.menuUrl || <span className="text-muted-foreground/40 italic text-xs">—</span>}
                        </TableCell>
                        <TableCell>
                          {menu.isParentMenu ? (
                            <Badge variant="secondary" className="rounded-sm gap-1">
                              <FolderOpen className="h-3 w-3" /> Dropdown
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-sm gap-1">
                              <Link className="h-3 w-3" /> Link
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{menu.sequence}</TableCell>
                        <TableCell>
                          <Badge variant={menu.isActive ? "secondary" : "outline"} className="rounded-sm">
                            {menu.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {showActions && (
                          <TableCell>
                            <div className="flex gap-1">
                              {canUpdate && (
                                <Button variant="ghost" size="sm" onClick={() => openEdit(menu)} className="h-8 w-8 p-0 rounded-sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button variant="ghost" size="sm" onClick={() => openDelete(menu)} className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive">
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

              {/* Is Parent Menu toggle */}
              <div className="flex items-center justify-between rounded-sm border px-4 py-3">
                <div>
                  <Label className="font-bold uppercase tracking-wider text-xs">Is Parent Menu (Dropdown)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable to allow child menus under this entry
                  </p>
                </div>
                <Switch
                  checked={form.isParentMenu}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isParentMenu: v }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Menu Name *</Label>
                  <Input
                    value={form.menuName}
                    onChange={(e) => setForm((p) => ({ ...p, menuName: e.target.value }))}
                    required
                    className="rounded-sm"
                    placeholder="e.g. Settings"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">
                    Menu URL {form.isParentMenu && <span className="text-muted-foreground normal-case font-normal">(optional for dropdowns)</span>}
                  </Label>
                  <Input
                    value={form.menuUrl}
                    onChange={(e) => setForm((p) => ({ ...p, menuUrl: e.target.value }))}
                    required={!form.isParentMenu}
                    className="rounded-sm font-mono text-sm"
                    placeholder={form.isParentMenu ? "#" : "/admin/settings"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Icon (Lucide name)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                    className="rounded-sm"
                    placeholder="e.g. Settings"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Sequence</Label>
                  <Input
                    type="number"
                    value={form.sequence}
                    onChange={(e) => setForm((p) => ({ ...p, sequence: parseInt(e.target.value) || 0 }))}
                    className="rounded-sm"
                  />
                </div>
              </div>

              {/* Parent selector — shows path breadcrumb */}
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-wider text-xs">Parent Menu</Label>
                <Select
                  value={form.parentMenu ?? "none"}
                  onValueChange={(v) => setForm((p) => ({ ...p, parentMenu: v === "none" ? null : v }))}
                >
                  <SelectTrigger className="rounded-sm">
                    <SelectValue placeholder="None (root level)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="none">
                      <span className="text-muted-foreground italic">None — root level</span>
                    </SelectItem>
                    {parentCandidates.map((m) => (
                      <SelectItem key={m._id} value={String(m._id)}>
                        <span className="flex items-center gap-1.5">
                          <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {buildPath(m._id, menus)}
                        </span>
                      </SelectItem>
                    ))}
                    {parentCandidates.length === 0 && (
                      <SelectItem value="none" disabled>
                        <span className="text-muted-foreground text-xs">
                          No parent menus yet — create a dropdown first
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.parentMenu && (
                  <p className="text-xs text-muted-foreground">
                    Path: <span className="font-mono text-foreground">{buildPath(form.parentMenu, menus)}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-sm border px-4 py-3">
                <Label className="font-bold uppercase tracking-wider text-xs">Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setError(null); }} disabled={formLoading} className="rounded-sm">
                Cancel
              </Button>
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
        description={`Delete "${selected?.menuName}"? This cannot be undone. Child menus must be removed first.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
