import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import {
  Loader2, Lock, ChevronDown, ChevronRight, Check, Minus, ShieldCheck,
} from "lucide-react";

// ─── Permission Matrix ────────────────────────────────────────────────────────

function PermissionMatrix({ menus, actions, permissions, onChange, isSuperAdmin, actorMenuPermissions }) {
  const [collapsed, setCollapsed] = useState({});

  const getGranted = (menuId, actionId) =>
    permissions.some((p) => p.menuId === menuId && p.actionTypeId === actionId && p.granted);

  const isActorAllowed = (menuId, actionId) => {
    if (isSuperAdmin) return true;
    if (!actorMenuPermissions) return false;
    return actorMenuPermissions.some(
      (p) => p.menuId === menuId && p.actionTypeId === actionId && p.granted
    );
  };

  const setGrant = (menuId, actionId, value) => {
    const next = permissions.filter((p) => !(p.menuId === menuId && p.actionTypeId === actionId));
    next.push({ menuId, actionTypeId: actionId, granted: value });
    onChange(next);
  };

  const toggleRow = (menuId) => {
    const eligible = actions.filter((a) => isActorAllowed(menuId, a._id));
    const allOn = eligible.every((a) => getGranted(menuId, a._id));
    let next = [...permissions];
    for (const a of eligible) {
      next = next.filter((p) => !(p.menuId === menuId && p.actionTypeId === a._id));
      next.push({ menuId, actionTypeId: a._id, granted: !allOn });
    }
    onChange(next);
  };

  const toggleCol = (actionId) => {
    const eligible = menus.filter((m) => isActorAllowed(m._id, actionId));
    const allOn = eligible.every((m) => getGranted(m._id, actionId));
    let next = [...permissions];
    for (const m of eligible) {
      next = next.filter((p) => !(p.menuId === m._id && p.actionTypeId === actionId));
      next.push({ menuId: m._id, actionTypeId: actionId, granted: !allOn });
    }
    onChange(next);
  };

  const rowState = (menuId) => {
    const eligible = actions.filter((a) => isActorAllowed(menuId, a._id));
    if (!eligible.length) return "locked";
    const on = eligible.filter((a) => getGranted(menuId, a._id)).length;
    if (on === 0) return "none";
    if (on === eligible.length) return "all";
    return "partial";
  };

  const colState = (actionId) => {
    const eligible = menus.filter((m) => isActorAllowed(m._id, actionId));
    if (!eligible.length) return "locked";
    const on = eligible.filter((m) => getGranted(m._id, actionId)).length;
    if (on === 0) return "none";
    if (on === eligible.length) return "all";
    return "partial";
  };

  const StateIndicator = ({ state, onClick, className = "" }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "locked"}
      className={`w-4 h-4 flex items-center justify-center rounded border transition-all duration-150 flex-shrink-0
        ${state === "all" ? "bg-primary border-primary text-primary-foreground" :
          state === "partial" ? "bg-primary/20 border-primary text-primary" :
          state === "locked" ? "bg-muted border-border cursor-not-allowed" :
          "border-border hover:border-primary/60 hover:bg-muted/40"}
        ${className}`}
    >
      {state === "all" && <Check className="w-2.5 h-2.5" />}
      {state === "partial" && <Minus className="w-2.5 h-2.5" />}
      {state === "locked" && <Lock className="w-2 h-2 text-muted-foreground/40" />}
    </button>
  );

  const roots = menus.filter((m) => m.isRoot).sort((a, b) => a.sequence - b.sequence);
  const childrenOf = (parentId) =>
    menus.filter((m) => !m.isRoot && String(m.parentMenu) === String(parentId))
      .sort((a, b) => a.sequence - b.sequence);

  const renderLeafRow = (menu, depth = 0) => (
    <tr
      key={menu._id}
      className="border-b border-border/40 transition-colors hover:bg-muted/20"
      style={{ backgroundColor: depth > 0 ? "color-mix(in srgb, var(--muted) 15%, transparent)" : undefined }}
    >
      <td className="py-2.5 border-r border-border/40" style={{ paddingLeft: `${depth * 20 + 16}px`, paddingRight: "12px" }}>
        <div className="flex items-center gap-2">
          <StateIndicator state={rowState(menu._id)} onClick={() => toggleRow(menu._id)} />
          <div className="min-w-0">
            <div className={`font-medium text-sm leading-tight ${depth > 0 ? "text-muted-foreground" : "text-foreground"}`}>
              {menu.menuName}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/50 truncate">{menu.menuUrl}</div>
          </div>
        </div>
      </td>
      {actions.map((action) => {
        const allowed = isActorAllowed(menu._id, action._id);
        const granted = getGranted(menu._id, action._id);
        return (
          <td key={action._id} className="py-2.5 px-3 text-center border-r border-border/30 last:border-r-0">
            {allowed ? (
              <input
                type="checkbox"
                checked={granted}
                onChange={(e) => setGrant(menu._id, action._id, e.target.checked)}
                className="h-4 w-4 rounded cursor-pointer accent-primary"
              />
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground/30 mx-auto" title="You cannot grant this permission" />
            )}
          </td>
        );
      })}
    </tr>
  );

  if (!menus.length || !actions.length) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm border rounded-sm">
        {!menus.length ? "No active menus. Add menus in Menu Master first." : "No active action types defined."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-sm">
      <table className="w-full text-sm bg-card">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="py-3 pl-4 pr-3 text-left font-bold uppercase tracking-wider text-xs border-r border-border/50 w-64 min-w-[200px]">
              Menu / Resource
            </th>
            {actions.map((action) => (
              <th
                key={action._id}
                className="py-3 px-3 text-center font-bold uppercase tracking-wider text-xs border-r border-border/30 last:border-r-0 min-w-[80px]"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <StateIndicator state={colState(action._id)} onClick={() => toggleCol(action._id)} />
                  <span className="font-mono text-[10px] text-muted-foreground">{action.actionCode}</span>
                  <span className="text-[9px] text-muted-foreground/60 leading-tight">{action.actionName}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roots.map((root) => {
            const subs = childrenOf(root._id);
            const isOpen = collapsed[root._id] !== true;
            return (
              <>
                <tr
                  key={root._id}
                  className="border-b border-border/60 bg-muted/5 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-3 pl-4 pr-3 border-r border-border/50">
                    <div className="flex items-center gap-2">
                      {subs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCollapsed((p) => ({ ...p, [root._id]: !p[root._id] }))}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                        >
                          {isOpen
                            ? <ChevronDown className="h-3.5 w-3.5" />
                            : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      <StateIndicator state={rowState(root._id)} onClick={() => toggleRow(root._id)} />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground leading-tight">{root.menuName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground/50 truncate">{root.menuUrl}</div>
                      </div>
                    </div>
                  </td>
                  {actions.map((action) => {
                    const allowed = isActorAllowed(root._id, action._id);
                    const granted = getGranted(root._id, action._id);
                    return (
                      <td key={action._id} className="py-3 px-3 text-center border-r border-border/30 last:border-r-0">
                        {allowed ? (
                          <input
                            type="checkbox"
                            checked={granted}
                            onChange={(e) => setGrant(root._id, action._id, e.target.checked)}
                            className="h-4 w-4 rounded cursor-pointer accent-primary"
                          />
                        ) : (
                          <Lock className="h-3 w-3 text-muted-foreground/30 mx-auto" title="You cannot grant this permission" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                {isOpen && subs.map((sub) => renderLeafRow(sub, 1))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Grant All helper ─────────────────────────────────────────────────────────

function buildGrantAll(menus, actions, isSuperAdmin, rbacPermissions) {
  const result = [];
  for (const m of menus) {
    for (const a of actions) {
      const actorCanGrant = isSuperAdmin || (rbacPermissions?.[m.menuUrl] ?? []).includes(a.actionCode);
      if (actorCanGrant) result.push({ menuId: m._id, actionTypeId: a._id, granted: true });
    }
  }
  return result;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoleEditPage() {
  const { api, session } = useAuth();
  const { roleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isNew = !roleId;
  const isSuperAdmin = session?.user?.role === "super_admin";
  const { write: canCreate, edit: canUpdate } = useRbacPagePermissions();
  const canWrite = isNew ? canCreate : canUpdate;

  const [menus, setMenus] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(() => {
    const passedRole = location.state?.role;
    if (passedRole) {
      return {
        roleName: passedRole.roleName,
        isActive: passedRole.isActive,
        permissions: passedRole.permissions ? [...passedRole.permissions] : [],
      };
    }
    return { roleName: "", isActive: true, permissions: [] };
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menusRes, actionsRes] = await Promise.all([
        api.get("/api/v1/rbac/menus"),
        api.get("/api/v1/rbac/actions"),
      ]);
      setMenus(menusRes.data.filter((m) => m.isActive));
      setActions(actionsRes.data.filter((a) => a.isActive));

      // If no role was passed via state (e.g. direct URL), fetch all roles and find by ID
      if (!isNew && !location.state?.role) {
        const rolesRes = await api.get("/api/v1/rbac/roles");
        const role = rolesRes.data.find((r) => r._id === roleId);
        if (role) {
          setForm({
            roleName: role.roleName,
            isActive: role.isActive,
            permissions: role.permissions ? [...role.permissions] : [],
          });
        } else {
          setError("Role not found");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [api, isNew, roleId, location.state?.role]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.roleName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await api.post("/api/v1/rbac/roles", form);
      } else {
        await api.put(`/api/v1/rbac/roles/${roleId}`, form);
      }
      navigate("/rbac/roles");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save role");
      setSaving(false);
    }
  };

  const grantedCount = form.permissions.filter((p) => p.granted).length;
  const totalPossible = menus.length * actions.length;

  return (
    <div className="space-y-6">
      <Breadcrumb
        title={isNew ? "Create Role" : "Edit Role"}
        items={[
          { label: "Home", path: "/" },
          { label: "RBAC" },
          { label: "Roles", path: "/rbac/roles" },
          { label: isNew ? "New Role" : (form.roleName || "Edit") },
        ]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Role Details */}
          <Card className="rounded-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-bold uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Role Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Role Name</Label>
                  <Input
                    value={form.roleName}
                    onChange={(e) => setForm((p) => ({ ...p, roleName: e.target.value }))}
                    required
                    disabled={!canWrite}
                    className="rounded-sm"
                    placeholder="e.g. Support Manager"
                  />
                </div>
                <div className="flex items-center gap-3 pb-1">
                  <Label className="font-bold uppercase tracking-wider text-xs">Active</Label>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                    disabled={!canWrite}
                  />
                </div>
                <div className="pb-1 text-right">
                  <div className="text-3xl font-bold text-primary tabular-nums">{grantedCount}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    of {totalPossible} permissions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card className="rounded-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="font-bold uppercase tracking-wider">Permission Matrix</CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click a menu row or action column header to toggle all checkboxes in that row/column.
                  {!isSuperAdmin && (
                    <span className="ml-1 inline-flex items-center gap-1 text-muted-foreground/70">
                      <Lock className="h-3 w-3" /> Locked cells = permissions you don't hold and cannot grant.
                    </span>
                  )}
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="outline" className="rounded-sm text-xs font-normal">
                    {menus.filter((m) => !m.isRoot).length} leaf menus
                  </Badge>
                  <Badge variant="outline" className="rounded-sm text-xs font-normal">
                    {actions.length} action types
                  </Badge>
                </div>
              </div>
              {canWrite && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-sm text-xs"
                    onClick={() => onChange([])}
                    disabled={!grantedCount}
                  >
                    Revoke All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-sm text-xs"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        permissions: buildGrantAll(menus, actions, isSuperAdmin, session?.rbacPermissions),
                      }))
                    }
                  >
                    Grant All
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <PermissionMatrix
                menus={menus}
                actions={actions}
                permissions={form.permissions}
                onChange={canWrite ? (p) => setForm((prev) => ({ ...prev, permissions: p })) : () => {}}
                isSuperAdmin={isSuperAdmin}
                actorMenuPermissions={null}
              />
            </CardContent>
          </Card>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/rbac/roles")}
              disabled={saving}
              className="rounded-sm"
            >
              Cancel
            </Button>
            {canWrite ? (
              <Button type="submit" disabled={saving || !form.roleName.trim()} className="rounded-sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? "Create Role" : "Save Changes"}
              </Button>
            ) : (
              <Badge variant="outline" className="rounded-sm text-xs text-muted-foreground">
                <Lock className="h-3 w-3 mr-1" /> Read-only
              </Badge>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
