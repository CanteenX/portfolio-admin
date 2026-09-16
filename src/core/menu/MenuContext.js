import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Provides the menu tree. Nothing more.
 *
 * This used to also resolve per-page permissions, but that machinery read
 * `session.currentRolePermissions`, which only ever existed for admins holding
 * a CustomRole. A-6 retired CustomRole — it narrowed the UI while the API
 * stayed open to any admin, so it was theatre rather than access control — and
 * with it the field. What was left returned "no permissions" for every
 * non-super-admin and was consumed by exactly one component (PermissionGate),
 * itself unused since the screens moved to `RbacGate`.
 *
 * Page permissions now come from `useRbacPagePermissions`, which reads
 * `session.rbacPermissions` — the grants the server actually enforces.
 */
const MenuContext = createContext({
  menuGroups: [],
  loading: true,
  findMenuIdByUrl: () => null,
  invalidateMenuCache: () => {},
});

export function useMenuContext() {
  return useContext(MenuContext);
}

function findMenuIdInItems(items, cleanUrl) {
  for (const item of items) {
    if (item.route && (item.route === cleanUrl || cleanUrl.endsWith(item.route))) {
      return item._id;
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuIdInItems(item.children, cleanUrl);
      if (found) return found;
    }
  }
  return null;
}

/**
 * @param {{ children: React.ReactNode, menuGroups?: Array }} props
 */
export function MenuProvider({ children, menuGroups: initialMenuGroups }) {
  const [menuGroups, setMenuGroups] = useState(initialMenuGroups ?? []);
  const [loading] = useState(false);

  useEffect(() => {
    if (initialMenuGroups) {
      setMenuGroups(initialMenuGroups);
    }
  }, [initialMenuGroups]);

  const findMenuIdByUrl = useCallback(
    (url) => {
      const cleanUrl = url.split("?")[0].replace(/\/+$/, "");
      for (const group of menuGroups) {
        if (group.isLink && group.route && (group.route === cleanUrl || cleanUrl.endsWith(group.route))) {
          return group._id;
        }
        const found = findMenuIdInItems(group.menus, cleanUrl);
        if (found) return found;
      }
      return null;
    },
    [menuGroups]
  );

  const invalidateMenuCache = useCallback(() => {
    setMenuGroups([]);
  }, []);

  const value = useMemo(
    () => ({
      menuGroups,
      loading,
      findMenuIdByUrl,
      invalidateMenuCache,
    }),
    [menuGroups, loading, findMenuIdByUrl, invalidateMenuCache]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
