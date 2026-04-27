import type {
  MenuGroup,
  MenuItem,
  MenuPermissionEntry,
  PermissionAction,
} from "@admin-platform/shared-types";
import { PERMISSION_ACTIONS } from "@admin-platform/shared-types";

// ── Helpers ────────────────────────────────────────────────────────

function findEntry(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean
): MenuPermissionEntry | undefined {
  return permissions.find((p) =>
    isGroup ? p.menuGroupId === id : p.menuId === id
  );
}

function ensureEntry(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean
): { entries: MenuPermissionEntry[]; entry: MenuPermissionEntry } {
  const existing = findEntry(permissions, id, isGroup);
  if (existing) {
    return { entries: permissions, entry: existing };
  }
  const newEntry: MenuPermissionEntry = {
    ...(isGroup ? { menuGroupId: id } : { menuId: id }),
    read: false,
    create: false,
    update: false,
    delete: false,
    export: false,
  };
  return { entries: [...permissions, newEntry], entry: newEntry };
}

function replaceEntry(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean,
  updated: MenuPermissionEntry
): MenuPermissionEntry[] {
  const key = isGroup ? "menuGroupId" : "menuId";
  const idx = permissions.findIndex((p) => p[key] === id);
  if (idx === -1) return [...permissions, updated];
  return permissions.map((p, i) => (i === idx ? updated : p));
}

/** Collect all {id, isGroup} pairs from menu groups (recursive). */
function collectAllIds(
  menuGroups: MenuGroup[]
): Array<{ id: string; isGroup: boolean }> {
  const ids: Array<{ id: string; isGroup: boolean }> = [];

  const walkItems = (items: MenuItem[]) => {
    for (const item of items) {
      ids.push({ id: item._id, isGroup: false });
      if (item.children && item.children.length > 0) {
        walkItems(item.children);
      }
    }
  };

  for (const group of menuGroups) {
    if (group.isLink) {
      ids.push({ id: group._id, isGroup: true });
    } else {
      walkItems(group.menus);
    }
  }

  return ids;
}

/** Collect all {id, isGroup} pairs within a single group. */
function collectGroupIds(
  group: MenuGroup
): Array<{ id: string; isGroup: boolean }> {
  const ids: Array<{ id: string; isGroup: boolean }> = [];

  if (group.isLink) {
    ids.push({ id: group._id, isGroup: true });
  } else {
    const walkItems = (items: MenuItem[]) => {
      for (const item of items) {
        ids.push({ id: item._id, isGroup: false });
        if (item.children && item.children.length > 0) {
          walkItems(item.children);
        }
      }
    };
    walkItems(group.menus);
  }

  return ids;
}

// ── Query Functions ────────────────────────────────────────────────

export function hasPermission(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean,
  action: PermissionAction
): boolean {
  const entry = findEntry(permissions, id, isGroup);
  return entry ? entry[action] : false;
}

export function hasAllPermissions(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean
): boolean {
  const entry = findEntry(permissions, id, isGroup);
  if (!entry) return false;
  return PERMISSION_ACTIONS.every((a) => entry[a]);
}

export function hasAnyPermissions(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean
): boolean {
  const entry = findEntry(permissions, id, isGroup);
  if (!entry) return false;
  return PERMISSION_ACTIONS.some((a) => entry[a]);
}

/** True if every menu/group in the tree has the given action enabled. */
export function hasColumnAllPermissions(
  permissions: MenuPermissionEntry[],
  menuGroups: MenuGroup[],
  action: PermissionAction
): boolean {
  const all = collectAllIds(menuGroups);
  return all.every(({ id, isGroup }) => hasPermission(permissions, id, isGroup, action));
}

/** True if every menu in the given group has all 5 actions enabled. */
export function hasGroupAllPermissions(
  permissions: MenuPermissionEntry[],
  menuGroups: MenuGroup[],
  groupId: string
): boolean {
  const group = menuGroups.find((g) => g._id === groupId);
  if (!group) return false;
  const ids = collectGroupIds(group);
  return ids.every(({ id, isGroup }) => hasAllPermissions(permissions, id, isGroup));
}

/** True if any menu in the given group has any action enabled. */
export function hasGroupAnyPermissions(
  permissions: MenuPermissionEntry[],
  menuGroups: MenuGroup[],
  groupId: string
): boolean {
  const group = menuGroups.find((g) => g._id === groupId);
  if (!group) return false;
  const ids = collectGroupIds(group);
  return ids.some(({ id, isGroup }) => hasAnyPermissions(permissions, id, isGroup));
}

// ── Mutation Functions (immutable — return new arrays) ─────────────

/** Toggle a single action for a single menu/group. */
export function togglePermission(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean,
  action: PermissionAction,
  checked: boolean
): MenuPermissionEntry[] {
  const { entries, entry } = ensureEntry(permissions, id, isGroup);
  const updated: MenuPermissionEntry = { ...entry, [action]: checked };
  return replaceEntry(entries, id, isGroup, updated);
}

/** Toggle all 5 actions for a single menu/group. */
export function toggleAllRow(
  permissions: MenuPermissionEntry[],
  id: string,
  isGroup: boolean,
  checked: boolean
): MenuPermissionEntry[] {
  const { entries, entry } = ensureEntry(permissions, id, isGroup);
  const updated: MenuPermissionEntry = { ...entry };
  for (const a of PERMISSION_ACTIONS) {
    updated[a] = checked;
  }
  return replaceEntry(entries, id, isGroup, updated);
}

/** Toggle a single action across ALL menus/groups. */
export function toggleColumn(
  permissions: MenuPermissionEntry[],
  menuGroups: MenuGroup[],
  action: PermissionAction,
  checked: boolean
): MenuPermissionEntry[] {
  const all = collectAllIds(menuGroups);
  let result = [...permissions];
  for (const { id, isGroup } of all) {
    result = togglePermission(result, id, isGroup, action, checked);
  }
  return result;
}

/** Toggle all actions for all menus in a specific group. */
export function toggleGroup(
  permissions: MenuPermissionEntry[],
  menuGroups: MenuGroup[],
  groupId: string,
  checked: boolean
): MenuPermissionEntry[] {
  const group = menuGroups.find((g) => g._id === groupId);
  if (!group) return permissions;
  const ids = collectGroupIds(group);
  let result = [...permissions];
  for (const { id, isGroup } of ids) {
    result = toggleAllRow(result, id, isGroup, checked);
  }
  return result;
}
