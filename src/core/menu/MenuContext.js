import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { PERMISSION_ACTIONS } from "@admin-platform/shared-types";

const ALL_TRUE = { read: true, create: true, update: true, delete: true, export: true };
const ALL_FALSE = { read: false, create: false, update: false, delete: false, export: false };

const MenuContext = createContext({
  menuGroups: [],
  loading: true,
  currentPagePermissions: ALL_FALSE,
  getPermissionsForMenu: () => ALL_FALSE,
  findMenuIdByUrl: () => null,
  invalidateMenuCache: () => {},
});

export function useMenuContext() {
  return useContext(MenuContext);
}

export function usePagePermissions() {
  const { currentPagePermissions } = useContext(MenuContext);
  return currentPagePermissions;
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
 * @param {{ children: React.ReactNode, menuGroups?: Array, rolePermissions?: Array, isSuperAdmin: boolean }} props
 */
export function MenuProvider({ children, menuGroups: initialMenuGroups, rolePermissions, isSuperAdmin }) {
  const [menuGroups, setMenuGroups] = useState(initialMenuGroups ?? []);
  const [loading] = useState(false);
  const { pathname } = useLocation();

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

  const getPermissionsForMenu = useCallback(
    (menuId) => {
      if (isSuperAdmin) return ALL_TRUE;
      if (!rolePermissions) return ALL_FALSE;

      const entry = rolePermissions.find(
        (p) => p.menuId === menuId || p.menuGroupId === menuId
      );
      if (!entry) return ALL_FALSE;

      const result = {};
      for (const action of PERMISSION_ACTIONS) {
        result[action] = entry[action];
      }
      return result;
    },
    [isSuperAdmin, rolePermissions]
  );

  const currentPagePermissions = useMemo(() => {
    if (isSuperAdmin) return ALL_TRUE;
    const menuId = findMenuIdByUrl(pathname);
    if (!menuId) return ALL_FALSE;
    return getPermissionsForMenu(menuId);
  }, [isSuperAdmin, pathname, findMenuIdByUrl, getPermissionsForMenu]);

  const invalidateMenuCache = useCallback(() => {
    setMenuGroups([]);
  }, []);

  const value = useMemo(
    () => ({
      menuGroups,
      loading,
      currentPagePermissions,
      getPermissionsForMenu,
      findMenuIdByUrl,
      invalidateMenuCache,
    }),
    [menuGroups, loading, currentPagePermissions, getPermissionsForMenu, findMenuIdByUrl, invalidateMenuCache]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
