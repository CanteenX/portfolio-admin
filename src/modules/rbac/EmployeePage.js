import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
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
import { Pencil, Plus, Loader2, ChevronRight, Power, AlertTriangle, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

// ─── Org-tree renderer ────────────────────────────────────────────────────────

function buildTree(employees) {
  const map = {};
  const roots = [];
  for (const emp of employees) map[emp._id] = { ...emp, children: [] };
  for (const emp of employees) {
    if (emp.parentEmployeeId && map[emp.parentEmployeeId]) {
      map[emp.parentEmployeeId].children.push(map[emp._id]);
    } else {
      roots.push(map[emp._id]);
    }
  }
  return roots;
}

function EmployeeTreeRow({ node, depth = 0, onEdit, onToggleStatus, canUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <TableRow>
        <TableCell style={{ paddingLeft: `${depth * 20 + 12}px` }}>
          <div className="flex items-center gap-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="p-0.5 rounded hover:bg-muted"
              >
                <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
              </button>
            ) : (
              <span className="w-4 inline-block" />
            )}
            <span className="font-medium">{node.employeeName}</span>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{node.emailOffice}</TableCell>
        <TableCell className="text-sm">{node.department || "—"}</TableCell>
        <TableCell className="text-sm">
          {node.roleId ? (
            <Badge variant="secondary" className="rounded-sm text-xs">{node.roleId.roleName ?? "Role"}</Badge>
          ) : (
            <span className="text-muted-foreground text-xs">No role</span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant={node.isActive ? "secondary" : "outline"} className="rounded-sm text-xs">
            {node.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        {canUpdate && (
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(node)} className="h-8 w-8 p-0 rounded-sm">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(node)}
                className={`h-8 w-8 p-0 rounded-sm ${node.isActive ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"}`}
              >
                <Power className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
      {expanded && hasChildren && node.children.map((child) => (
        <EmployeeTreeRow key={child._id} node={child} depth={depth + 1} onEdit={onEdit} onToggleStatus={onToggleStatus} canUpdate={canUpdate} />
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const emptyForm = {
  employeeName: "", emailOffice: "", department: "", contact: "", roleId: "", parentEmployeeId: "", password: "",
};

export default function EmployeePage() {
  const { api } = useAuth();

  const { write: canCreate, edit: canUpdate } = useRbacPagePermissions();

  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [cascadeCount, setCascadeCount] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [form, setForm] = useState(emptyForm);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const empParams = debouncedSearch ? { search: debouncedSearch } : {};
      const [empRes, rolesRes] = await Promise.all([
        api.get("/api/v1/rbac/employees", { params: empParams }),
        api.get("/api/v1/rbac/roles"),
      ]);
      setEmployees(empRes.data);
      setRoles(rolesRes.data.filter((r) => r.isActive));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [api, debouncedSearch]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const resetForm = () => { setForm(emptyForm); setSelected(null); };

  const openCreate = () => { resetForm(); setIsDialogOpen(true); };

  const openEdit = (emp) => {
    setSelected(emp);
    setForm({
      employeeName: emp.employeeName,
      emailOffice: emp.emailOffice,
      department: emp.department || "",
      contact: emp.contact || "",
      roleId: emp.roleId?._id ?? emp.roleId ?? "",
      parentEmployeeId: emp.parentEmployeeId?._id ?? emp.parentEmployeeId ?? "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const openToggleStatus = async (emp) => {
    setStatusTarget(emp);
    if (emp.isActive) {
      try {
        const res = await api.get(`/api/v1/rbac/employees/${emp._id}/cascade-impact`);
        setCascadeCount(res.data.affectedCount ?? 0);
      } catch {
        setCascadeCount(0);
      }
    } else {
      setCascadeCount(0);
    }
    setIsStatusDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const payload = {
        employeeName: form.employeeName,
        emailOffice: form.emailOffice,
        department: form.department,
        contact: form.contact,
        roleId: form.roleId || null,
        parentEmployeeId: form.parentEmployeeId || null,
        ...(selected ? {} : { password: form.password }),
      };
      if (selected) {
        await api.put(`/api/v1/rbac/employees/${selected._id}`, payload);
      } else {
        await api.post("/api/v1/rbac/employees", payload);
      }
      await loadAll();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    setFormLoading(true);
    try {
      await api.put(`/api/v1/rbac/employees/${statusTarget._id}/status`, { isActive: !statusTarget.isActive });
      await loadAll();
      setIsStatusDialogOpen(false);
      setStatusTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setFormLoading(false);
    }
  };

  const treeRoots = buildTree(employees);

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Employee Management"
        items={[{ label: "Home", path: "/" }, { label: "RBAC" }, { label: "Employees" }]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">{error}</div>
      )}

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-bold uppercase tracking-wider">
            Employee Directory
            <span className="ml-2 text-sm font-normal text-muted-foreground">(Hierarchy Tree)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button size="sm" onClick={openCreate} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> New Employee
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees..."
                className="rounded-sm pl-8 w-52"
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
                    <TableHead className="font-bold uppercase tracking-wider">Name</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">Email</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">Department</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider">Role</TableHead>
                    <TableHead className="font-bold uppercase tracking-wider w-24">Status</TableHead>
                    {canUpdate && <TableHead className="w-24 font-bold uppercase tracking-wider">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treeRoots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canUpdate ? 6 : 5} className="text-center py-12 text-muted-foreground">No employees found</TableCell>
                    </TableRow>
                  ) : (
                    treeRoots.map((root) => (
                      <EmployeeTreeRow
                        key={root._id}
                        node={root}
                        onEdit={openEdit}
                        onToggleStatus={openToggleStatus}
                        canUpdate={canUpdate}
                      />
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
        <DialogContent className="rounded-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              {selected ? "Edit Employee" : "Create Employee"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Full Name</Label>
                  <Input value={form.employeeName} onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))} required className="rounded-sm" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Office Email</Label>
                  <Input type="email" value={form.emailOffice} onChange={(e) => setForm((p) => ({ ...p, emailOffice: e.target.value }))} required className="rounded-sm" placeholder="jane@company.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Department</Label>
                  <Input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="rounded-sm" placeholder="Engineering" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Contact</Label>
                  <Input value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} className="rounded-sm" placeholder="+1234567890" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Assign Role</Label>
                  <Select value={form.roleId || "none"} onValueChange={(v) => setForm((p) => ({ ...p, roleId: v === "none" ? "" : v }))}>
                    <SelectTrigger className="rounded-sm"><SelectValue placeholder="No role" /></SelectTrigger>
                    <SelectContent className="rounded-sm">
                      <SelectItem value="none">No role</SelectItem>
                      {roles.map((r) => <SelectItem key={r._id} value={r._id}>{r.roleName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {!selected && (
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-xs">Parent Employee</Label>
                    <Select value={form.parentEmployeeId || "none"} onValueChange={(v) => setForm((p) => ({ ...p, parentEmployeeId: v === "none" ? "" : v }))}>
                      <SelectTrigger className="rounded-sm"><SelectValue placeholder="Top level" /></SelectTrigger>
                      <SelectContent className="rounded-sm">
                        <SelectItem value="none">Top level (no parent)</SelectItem>
                        {employees.map((e) => (
                          <SelectItem key={e._id} value={e._id}>{e.employeeName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {!selected && (
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required={!selected} className="rounded-sm" placeholder="Min 8 characters" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={formLoading} className="rounded-sm">
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selected ? "Update" : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cascading Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="rounded-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {statusTarget?.isActive ? "Disable Employee" : "Enable Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {statusTarget?.isActive && cascadeCount > 0 ? (
              <p className="text-sm">
                Disabling <span className="font-semibold">{statusTarget?.employeeName}</span> will also disable{" "}
                <span className="font-semibold">{cascadeCount}</span> sub-employee(s) under them.
              </p>
            ) : statusTarget?.isActive ? (
              <p className="text-sm">Disable <span className="font-semibold">{statusTarget?.employeeName}</span>?</p>
            ) : (
              <p className="text-sm">Re-enable <span className="font-semibold">{statusTarget?.employeeName}</span>?</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={formLoading} className="rounded-sm">Cancel</Button>
            <Button
              variant={statusTarget?.isActive ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={formLoading}
              className="rounded-sm"
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {statusTarget?.isActive ? "Disable" : "Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
