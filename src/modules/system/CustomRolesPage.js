import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { getCustomRoles, createCustomRole, deleteCustomRole } from "@admin-platform/shared-sdk";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { Shield, Trash2, Plus, Settings2 } from "lucide-react";

export default function CustomRolesPage() {
  const navigate = useNavigate();
  const { api, session } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState("");

  const loadRoles = () => {
    if (!api) return;
    getCustomRoles(api).then(setRoles).catch(() => setError("Failed to load roles")).finally(() => setLoading(false));
  };
  useEffect(loadRoles, [api]);

  if (session?.user?.role !== "super_admin") {
    return <div className="text-destructive p-6">Access denied. Super admin only.</div>;
  }
  if (loading) return <div className="space-y-3 max-w-2xl">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;

  const handleCreate = async () => {
    if (!api || !newName.trim()) return;
    const permissions = newPerms.split(",").map((p) => p.trim()).filter(Boolean);
    try {
      const role = await createCustomRole(api, { name: newName, permissions });
      setRoles([...roles, role]);
      setNewName(""); setNewPerms("");
    } catch { setError("Failed to create role"); }
  };

  const handleDelete = async (id) => {
    if (!api) return;
    try { await deleteCustomRole(api, id); setRoles(roles.filter((r) => r.id !== id)); }
    catch { setError("Failed to delete role"); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Breadcrumb title="Custom Roles" items={[{ label: "Home", path: "/" }, { label: "Settings" }, { label: "Custom Roles" }]} />
      {error && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">{error}</div>}

      <Card className="industrial-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="uppercase tracking-wider text-xs font-bold">Name</TableHead>
              <TableHead className="uppercase tracking-wider text-xs font-bold">Permissions</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-bold">{role.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.length > 0
                      ? role.permissions.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)
                      : <span className="text-muted-foreground text-xs">No permissions</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/settings/custom-roles/${role.id}/permissions`)}>
                      <Settings2 className="w-4 h-4 mr-1" /> Permissions
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(role.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No custom roles yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="industrial-card">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create New Role</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="space-y-1">
              <Label className="uppercase tracking-wider text-xs font-bold">Role Name</Label>
              <Input placeholder="e.g. Support Manager" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-52" />
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label className="uppercase tracking-wider text-xs font-bold">Permissions (comma-separated)</Label>
              <Input placeholder="read:tickets, write:tickets" value={newPerms} onChange={(e) => setNewPerms(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} className="font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
