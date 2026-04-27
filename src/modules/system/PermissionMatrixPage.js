import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import {
  getCustomRoles,
  getMenuGroups,
  getRoleStructuredPermissions,
  updateRoleStructuredPermissions,
  hasPermission,
  hasAllPermissions,
  hasAnyPermissions,
  hasColumnAllPermissions,
  hasGroupAllPermissions,
  hasGroupAnyPermissions,
  togglePermission,
  toggleAllRow,
  toggleColumn,
  toggleGroup,
} from "@admin-platform/shared-sdk";
import { PERMISSION_ACTIONS } from "@admin-platform/shared-types";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  CheckCircle,
  XCircle,
  Folder,
  File,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const ACTION_LABELS = {
  read: "Read",
  create: "Create",
  update: "Update",
  delete: "Delete",
  export: "Export",
};

/** @param {{ item: import("@admin-platform/shared-types").MenuItem, depth: number, permissions: import("@admin-platform/shared-types").MenuPermissionEntry[], hoveredRow: string|null, onHover: (id:string|null)=>void, onTogglePermission: Function, onToggleAllRow: Function }} props */
function MenuItemRow({
  item,
  depth,
  permissions,
  hoveredRow,
  onHover,
  onTogglePermission,
  onToggleAllRow,
}) {
  const allChecked = hasAllPermissions(permissions, item._id, false);
  const anyChecked = hasAnyPermissions(permissions, item._id, false);
  const isHovered = hoveredRow === item._id;

  return (
    <>
      <TableRow
        className={`transition-colors ${isHovered ? "bg-accent/50" : anyChecked ? "bg-green-50 dark:bg-green-950/20" : ""}`}
        onMouseEnter={() => onHover(item._id)}
        onMouseLeave={() => onHover(null)}
      >
        <TableCell style={{ paddingLeft: `${1 + depth * 1.5}rem` }}>
          <div className="flex items-center gap-2">
            {depth > 0 && (
              <span className="text-muted-foreground text-xs">{"\u2514"}</span>
            )}
            {item.isParent ? (
              <Folder className="w-4 h-4 text-primary" />
            ) : (
              <File className="w-4 h-4 text-sky-500" />
            )}
            <span className={item.isParent ? "font-semibold" : ""}>
              {item.name}
            </span>
            {allChecked && (
              <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                All
              </span>
            )}
            <button
              className="ml-auto p-1 rounded hover:bg-accent"
              onClick={() => onToggleAllRow(item._id, false, !allChecked)}
              title={allChecked ? "Revoke all" : "Grant all"}
            >
              {allChecked ? (
                <XCircle className="w-4 h-4 text-destructive" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </button>
          </div>
        </TableCell>
        {PERMISSION_ACTIONS.map((action) => (
          <TableCell key={action} className="text-center w-20">
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer accent-primary"
              checked={hasPermission(permissions, item._id, false, action)}
              onChange={(e) =>
                onTogglePermission(item._id, false, action, e.target.checked)
              }
            />
          </TableCell>
        ))}
      </TableRow>
      {item.children?.map((child) => (
        <MenuItemRow
          key={child._id}
          item={child}
          depth={depth + 1}
          permissions={permissions}
          hoveredRow={hoveredRow}
          onHover={onHover}
          onTogglePermission={onTogglePermission}
          onToggleAllRow={onToggleAllRow}
        />
      ))}
    </>
  );
}

export default function PermissionMatrixPage() {
  const { api, session } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [menuGroups, setMenuGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [savedPermissions, setSavedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const isDirty = useMemo(
    () => JSON.stringify(permissions) !== JSON.stringify(savedPermissions),
    [permissions, savedPermissions]
  );

  useEffect(() => {
    if (!api) return;
    Promise.all([getCustomRoles(api), getMenuGroups(api)])
      .then(([r, m]) => {
        setRoles(r);
        setMenuGroups(m);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    if (!api || !selectedRoleId) {
      setPermissions([]);
      setSavedPermissions([]);
      return;
    }
    setLoading(true);
    getRoleStructuredPermissions(api, selectedRoleId)
      .then((p) => {
        setPermissions(p);
        setSavedPermissions(p);
      })
      .catch(() => toast.error("Failed to load permissions"))
      .finally(() => setLoading(false));
  }, [api, selectedRoleId]);

  const handleSave = useCallback(async () => {
    if (!api || !selectedRoleId) return;
    setSaving(true);
    try {
      await updateRoleStructuredPermissions(api, selectedRoleId, permissions);
      setSavedPermissions(permissions);
      toast.success("Permissions saved");
    } catch {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  }, [api, selectedRoleId, permissions]);

  const handleTogglePermission = useCallback(
    (id, isGroup, action, checked) => {
      setPermissions((prev) => togglePermission(prev, id, isGroup, action, checked));
    },
    []
  );

  const handleToggleAllRow = useCallback(
    (id, isGroup, checked) => {
      setPermissions((prev) => toggleAllRow(prev, id, isGroup, checked));
    },
    []
  );

  const handleToggleColumn = useCallback(
    (action, checked) => {
      setPermissions((prev) => toggleColumn(prev, menuGroups, action, checked));
    },
    [menuGroups]
  );

  const handleToggleGroup = useCallback(
    (groupId, checked) => {
      setPermissions((prev) => toggleGroup(prev, menuGroups, groupId, checked));
    },
    [menuGroups]
  );

  if (session?.user?.role !== "super_admin") {
    return (
      <div className="text-destructive p-6">Access denied. Super admin only.</div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Permission Matrix"
        items={[
          { label: "Home", path: "/" },
          { label: "Settings" },
          { label: "Custom Roles", path: "/settings/custom-roles" },
          { label: "Permission Matrix" },
        ]}
      />

      <Card className="industrial-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight">
              Role Permission Matrix
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a role and configure granular menu-level permissions
            </p>
          </div>
          {selectedRoleId && (
            <Button onClick={handleSave} disabled={saving || !isDirty}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              {saving ? "Saving..." : "Save Permissions"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-xs">
            <Select
              value={selectedRoleId ?? ""}
              onValueChange={(val) => setSelectedRoleId(val || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isDirty && selectedRoleId && (
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded px-3 py-2 mb-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              You have unsaved changes. Click &quot;Save Permissions&quot; to apply.
            </div>
          )}

          {loading && selectedRoleId ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : selectedRoleId ? (
            <div className="overflow-auto max-h-[calc(100vh-340px)] border rounded">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[40%] uppercase tracking-wider text-xs font-bold">
                      Menu
                    </TableHead>
                    {PERMISSION_ACTIONS.map((action) => (
                      <TableHead
                        key={action}
                        className="w-20 text-center uppercase tracking-wider text-xs font-bold"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{ACTION_LABELS[action]}</span>
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer accent-primary"
                            checked={hasColumnAllPermissions(
                              permissions,
                              menuGroups,
                              action
                            )}
                            onChange={(e) =>
                              handleToggleColumn(action, e.target.checked)
                            }
                          />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuGroups.map((group) => (
                    <GroupSection
                      key={group._id}
                      group={group}
                      permissions={permissions}
                      menuGroups={menuGroups}
                      hoveredRow={hoveredRow}
                      onHover={setHoveredRow}
                      onTogglePermission={handleTogglePermission}
                      onToggleAllRow={handleToggleAllRow}
                      onToggleGroup={handleToggleGroup}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <h4 className="text-lg font-semibold text-muted-foreground">
                Select a Role
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a role from the dropdown above to manage its permissions
              </p>
            </div>
          )}

          {menuGroups.length > 0 && selectedRoleId && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Tip: Use column header checkboxes to toggle entire columns, group
              headers for all menus in a group, or row buttons for all
              permissions in a row.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GroupSection({
  group,
  permissions,
  menuGroups,
  hoveredRow,
  onHover,
  onTogglePermission,
  onToggleAllRow,
  onToggleGroup,
}) {
  const allChecked = hasGroupAllPermissions(permissions, menuGroups, group._id);
  const anyChecked = hasGroupAnyPermissions(permissions, menuGroups, group._id);

  return (
    <>
      <TableRow className="bg-primary/10">
        <TableCell colSpan={6} className="font-bold">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer accent-primary"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = !allChecked && anyChecked;
              }}
              onChange={(e) => onToggleGroup(group._id, e.target.checked)}
            />
            {group.name}
            {anyChecked && (
              <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                Permissions Set
              </span>
            )}
          </div>
        </TableCell>
      </TableRow>

      {group.isLink && (
        <TableRow
          className={`transition-colors ${hoveredRow === group._id ? "bg-accent/50" : anyChecked ? "bg-green-50 dark:bg-green-950/20" : ""}`}
          onMouseEnter={() => onHover(group._id)}
          onMouseLeave={() => onHover(null)}
        >
          <TableCell className="pl-6">
            <div className="flex items-center gap-2">
              <File className="w-4 h-4 text-sky-500" />
              <span>{group.name}</span>
              <button
                className="ml-auto p-1 rounded hover:bg-accent"
                onClick={() =>
                  onToggleAllRow(
                    group._id,
                    true,
                    !hasAllPermissions(permissions, group._id, true)
                  )
                }
              >
                {hasAllPermissions(permissions, group._id, true) ? (
                  <XCircle className="w-4 h-4 text-destructive" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </button>
            </div>
          </TableCell>
          {PERMISSION_ACTIONS.map((action) => (
            <TableCell key={action} className="text-center w-20">
              <input
                type="checkbox"
                className="w-4 h-4 cursor-pointer accent-primary"
                checked={hasPermission(permissions, group._id, true, action)}
                onChange={(e) =>
                  onTogglePermission(group._id, true, action, e.target.checked)
                }
              />
            </TableCell>
          ))}
        </TableRow>
      )}

      {!group.isLink &&
        group.menus.map((item) => (
          <MenuItemRow
            key={item._id}
            item={item}
            depth={0}
            permissions={permissions}
            hoveredRow={hoveredRow}
            onHover={onHover}
            onTogglePermission={onTogglePermission}
            onToggleAllRow={onToggleAllRow}
          />
        ))}

      {!group.isLink && group.menus.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={6}
            className="text-center text-muted-foreground py-4"
          >
            No menus in this group
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
