import { useState, useEffect } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import {
  getMenuGroups,
  createMenuGroup,
  updateMenuGroup,
  deleteMenuGroup,
  reorderMenuGroup,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItem,
} from "../../shared/sdk/menu";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Switch } from "../../components/ui/switch";
import {
  LayoutDashboard,
  Users,
  Ticket,
  ListChecks,
  CalendarDays,
  FolderKanban,
  Briefcase,
  ShoppingCart,
  FileText,
  MessageSquare,
  Mail,
  HardDrive,
  KeyRound,
  CreditCard,
  ScrollText,
  Settings,
  Palette,
  Shield,
  Bell,
  BarChart3,
  PieChart,
  Map,
  Layers,
  Sparkles,
  Search,
  Image,
  Clock,
  HelpCircle,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Icon mapping for dynamic icon rendering
const ICON_MAP = {
  LayoutDashboard,
  Users,
  Ticket,
  ListChecks,
  CalendarDays,
  FolderKanban,
  Briefcase,
  ShoppingCart,
  FileText,
  MessageSquare,
  Mail,
  HardDrive,
  KeyRound,
  CreditCard,
  ScrollText,
  Settings,
  Palette,
  Shield,
  Bell,
  BarChart3,
  PieChart,
  Map,
  Layers,
  Sparkles,
  Search,
  Image,
  Clock,
  HelpCircle,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

// Helper to render icon component
const renderIcon = (iconName) => {
  const IconComponent = ICON_MAP[iconName];
  return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
};

// Helper to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function MenuManagementPage() {
  const { api } = useAuth();
  const [menuGroups, setMenuGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states for Menu Groups
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isGroupDeleteDialogOpen, setIsGroupDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    slug: "",
    order: 0,
    isLink: false,
    route: "",
    icon: "LayoutDashboard",
  });

  // Dialog states for Menu Items
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isItemDeleteDialogOpen, setIsItemDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    slug: "",
    route: "",
    icon: "LayoutDashboard",
    groupId: "",
    order: 0,
    isParent: false,
  });

  const [formLoading, setFormLoading] = useState(false);

  // Load menu groups
  useEffect(() => {
    loadMenuGroups();
  }, []);

  const loadMenuGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const groups = await getMenuGroups(api);
      setMenuGroups(groups);
    } catch (err) {
      setError(err.message || "Failed to load menu groups");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────
  // Menu Groups Handlers
  // ────────────────────────────────────────────────────────────────────

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      await createMenuGroup(api, {
        name: groupFormData.name,
        slug: groupFormData.slug || generateSlug(groupFormData.name),
        order: groupFormData.order,
        isLink: groupFormData.isLink,
        route: groupFormData.isLink ? groupFormData.route : undefined,
        icon: groupFormData.icon,
      });
      await loadMenuGroups();
      setIsGroupDialogOpen(false);
      resetGroupForm();
    } catch (err) {
      setError(err.message || "Failed to create menu group");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      await updateMenuGroup(api, selectedGroup._id, {
        name: groupFormData.name,
        slug: groupFormData.slug,
        order: groupFormData.order,
        isLink: groupFormData.isLink,
        route: groupFormData.isLink ? groupFormData.route : undefined,
        icon: groupFormData.icon,
      });
      await loadMenuGroups();
      setIsGroupDialogOpen(false);
      resetGroupForm();
    } catch (err) {
      setError(err.message || "Failed to update menu group");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setFormLoading(true);
    setError(null);

    try {
      await deleteMenuGroup(api, selectedGroup._id);
      await loadMenuGroups();
      setIsGroupDeleteDialogOpen(false);
      setSelectedGroup(null);
    } catch (err) {
      setError(err.message || "Failed to delete menu group");
    } finally {
      setFormLoading(false);
    }
  };

  const handleMoveGroup = async (group, direction) => {
    const sortedGroups = [...menuGroups].sort((a, b) => a.order - b.order);
    const currentIndex = sortedGroups.findIndex((g) => g._id === group._id);

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sortedGroups.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetGroup = sortedGroups[targetIndex];

    try {
      await Promise.all([
        reorderMenuGroup(api, group._id, targetGroup.order),
        reorderMenuGroup(api, targetGroup._id, group.order),
      ]);
      await loadMenuGroups();
    } catch (err) {
      setError(err.message || "Failed to reorder menu groups");
    }
  };

  const openEditGroupDialog = (group) => {
    setSelectedGroup(group);
    setGroupFormData({
      name: group.name,
      slug: group.slug,
      order: group.order,
      isLink: group.isLink,
      route: group.route || "",
      icon: group.icon || "LayoutDashboard",
    });
    setIsGroupDialogOpen(true);
  };

  const openDeleteGroupDialog = (group) => {
    setSelectedGroup(group);
    setIsGroupDeleteDialogOpen(true);
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: "",
      slug: "",
      order: 0,
      isLink: false,
      route: "",
      icon: "LayoutDashboard",
    });
    setSelectedGroup(null);
  };

  // ────────────────────────────────────────────────────────────────────
  // Menu Items Handlers
  // ────────────────────────────────────────────────────────────────────

  const getAllMenuItems = () => {
    return menuGroups.flatMap((group) =>
      group.menus.map((item) => ({ ...item, groupName: group.name, groupId: group._id }))
    );
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      await createMenuItem(api, {
        groupId: itemFormData.groupId,
        name: itemFormData.name,
        slug: itemFormData.slug || generateSlug(itemFormData.name),
        route: itemFormData.route,
        icon: itemFormData.icon,
        parentId: null,
        order: itemFormData.order,
        isParent: itemFormData.isParent,
      });
      await loadMenuGroups();
      setIsItemDialogOpen(false);
      resetItemForm();
    } catch (err) {
      setError(err.message || "Failed to create menu item");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      await updateMenuItem(api, selectedItem._id, {
        name: itemFormData.name,
        slug: itemFormData.slug,
        route: itemFormData.route,
        icon: itemFormData.icon,
        order: itemFormData.order,
        isParent: itemFormData.isParent,
      });
      await loadMenuGroups();
      setIsItemDialogOpen(false);
      resetItemForm();
    } catch (err) {
      setError(err.message || "Failed to update menu item");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    setFormLoading(true);
    setError(null);

    try {
      await deleteMenuItem(api, selectedItem._id);
      await loadMenuGroups();
      setIsItemDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      setError(err.message || "Failed to delete menu item");
    } finally {
      setFormLoading(false);
    }
  };

  const handleMoveItem = async (item, direction) => {
    const allItems = getAllMenuItems();
    const groupItems = allItems.filter((i) => i.groupId === item.groupId);
    const sortedItems = [...groupItems].sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex((i) => i._id === item._id);

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sortedItems.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetItem = sortedItems[targetIndex];

    try {
      await Promise.all([
        reorderMenuItem(api, item._id, targetItem.order),
        reorderMenuItem(api, targetItem._id, item.order),
      ]);
      await loadMenuGroups();
    } catch (err) {
      setError(err.message || "Failed to reorder menu items");
    }
  };

  const openEditItemDialog = (item) => {
    setSelectedItem(item);
    setItemFormData({
      name: item.name,
      slug: item.slug,
      route: item.route,
      icon: item.icon || "LayoutDashboard",
      groupId: item.groupId,
      order: item.order,
      isParent: item.isParent,
    });
    setIsItemDialogOpen(true);
  };

  const openDeleteItemDialog = (item) => {
    setSelectedItem(item);
    setIsItemDeleteDialogOpen(true);
  };

  const resetItemForm = () => {
    setItemFormData({
      name: "",
      slug: "",
      route: "",
      icon: "LayoutDashboard",
      groupId: menuGroups.length > 0 ? menuGroups[0]._id : "",
      order: 0,
      isParent: false,
    });
    setSelectedItem(null);
  };

  // Get next order value
  const getNextGroupOrder = () => {
    return menuGroups.length > 0 ? Math.max(...menuGroups.map((g) => g.order)) + 1 : 0;
  };

  const getNextItemOrder = (groupId) => {
    const group = menuGroups.find((g) => g._id === groupId);
    return group && group.menus.length > 0 ? Math.max(...group.menus.map((i) => i.order)) + 1 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Menu Management"
        items={[
          { label: "Home", path: "/" },
          { label: "Settings", path: "/settings/system" },
          { label: "Menu Management" },
        ]}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="font-bold uppercase tracking-wider">
            Menu Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="groups" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 rounded-sm">
                <TabsTrigger value="groups" className="rounded-sm">
                  Menu Groups
                </TabsTrigger>
                <TabsTrigger value="items" className="rounded-sm">
                  Menu Items
                </TabsTrigger>
              </TabsList>

              {/* ──────────────────────────────────────────────────── */}
              {/* Menu Groups Tab */}
              {/* ──────────────────────────────────────────────────── */}
              <TabsContent value="groups" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      resetGroupForm();
                      setGroupFormData((prev) => ({
                        ...prev,
                        order: getNextGroupOrder(),
                      }));
                      setIsGroupDialogOpen(true);
                    }}
                    className="rounded-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>

                <div className="rounded-sm border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 font-bold uppercase tracking-wider">
                          #
                        </TableHead>
                        <TableHead className="w-16 font-bold uppercase tracking-wider">
                          Icon
                        </TableHead>
                        <TableHead className="font-bold uppercase tracking-wider">
                          Name
                        </TableHead>
                        <TableHead className="font-bold uppercase tracking-wider">
                          Slug
                        </TableHead>
                        <TableHead className="font-bold uppercase tracking-wider">
                          Route
                        </TableHead>
                        <TableHead className="w-24 font-bold uppercase tracking-wider">
                          Type
                        </TableHead>
                        <TableHead className="w-40 font-bold uppercase tracking-wider">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuGroups.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 text-muted-foreground"
                          >
                            No menu groups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...menuGroups]
                          .sort((a, b) => a.order - b.order)
                          .map((group, index) => (
                            <TableRow key={group._id}>
                              <TableCell className="font-medium">
                                {group.order}
                              </TableCell>
                              <TableCell>{renderIcon(group.icon)}</TableCell>
                              <TableCell className="font-medium">
                                {group.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {group.slug}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {group.isLink && group.route ? group.route : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={group.isLink ? "default" : "secondary"}
                                  className="rounded-sm"
                                >
                                  {group.isLink ? "Link" : "Group"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditGroupDialog(group)}
                                    className="h-8 w-8 p-0 rounded-sm"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteGroupDialog(group)}
                                    className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveGroup(group, "up")}
                                    disabled={index === 0}
                                    className="h-8 w-8 p-0 rounded-sm"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveGroup(group, "down")}
                                    disabled={index === menuGroups.length - 1}
                                    className="h-8 w-8 p-0 rounded-sm"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* ──────────────────────────────────────────────────── */}
              {/* Menu Items Tab */}
              {/* ──────────────────────────────────────────────────── */}
              <TabsContent value="items" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      resetItemForm();
                      if (menuGroups.length > 0) {
                        setItemFormData((prev) => ({
                          ...prev,
                          groupId: menuGroups[0]._id,
                          order: getNextItemOrder(menuGroups[0]._id),
                        }));
                      }
                      setIsItemDialogOpen(true);
                    }}
                    disabled={menuGroups.length === 0}
                    className="rounded-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Item
                  </Button>
                </div>

                {menuGroups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Create a menu group first before adding items
                  </div>
                ) : (
                  <div className="rounded-sm border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 font-bold uppercase tracking-wider">
                            #
                          </TableHead>
                          <TableHead className="w-16 font-bold uppercase tracking-wider">
                            Icon
                          </TableHead>
                          <TableHead className="font-bold uppercase tracking-wider">
                            Name
                          </TableHead>
                          <TableHead className="font-bold uppercase tracking-wider">
                            Slug
                          </TableHead>
                          <TableHead className="font-bold uppercase tracking-wider">
                            Route
                          </TableHead>
                          <TableHead className="w-32 font-bold uppercase tracking-wider">
                            Group
                          </TableHead>
                          <TableHead className="w-40 font-bold uppercase tracking-wider">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAllMenuItems().length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-12 text-muted-foreground"
                            >
                              No menu items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          getAllMenuItems()
                            .sort((a, b) => {
                              if (a.groupId !== b.groupId) {
                                const groupA = menuGroups.find((g) => g._id === a.groupId);
                                const groupB = menuGroups.find((g) => g._id === b.groupId);
                                return (groupA?.order || 0) - (groupB?.order || 0);
                              }
                              return a.order - b.order;
                            })
                            .map((item) => {
                              const groupItems = getAllMenuItems().filter(
                                (i) => i.groupId === item.groupId
                              );
                              const sortedGroupItems = [...groupItems].sort(
                                (a, b) => a.order - b.order
                              );
                              const itemIndex = sortedGroupItems.findIndex(
                                (i) => i._id === item._id
                              );

                              return (
                                <TableRow key={item._id}>
                                  <TableCell className="font-medium">
                                    {item.order}
                                  </TableCell>
                                  <TableCell>{renderIcon(item.icon)}</TableCell>
                                  <TableCell className="font-medium">
                                    {item.name}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {item.slug}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {item.route}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="rounded-sm">
                                      {item.groupName}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditItemDialog(item)}
                                        className="h-8 w-8 p-0 rounded-sm"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDeleteItemDialog(item)}
                                        className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMoveItem(item, "up")}
                                        disabled={itemIndex === 0}
                                        className="h-8 w-8 p-0 rounded-sm"
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMoveItem(item, "down")}
                                        disabled={
                                          itemIndex === sortedGroupItems.length - 1
                                        }
                                        className="h-8 w-8 p-0 rounded-sm"
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* Create/Edit Menu Group Dialog */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="rounded-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              {selectedGroup ? "Edit Menu Group" : "Create Menu Group"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={selectedGroup ? handleUpdateGroup : handleCreateGroup}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name" className="font-bold uppercase tracking-wider text-sm">
                  Name
                </Label>
                <Input
                  id="group-name"
                  value={groupFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setGroupFormData((prev) => ({
                      ...prev,
                      name,
                      slug: selectedGroup ? prev.slug : generateSlug(name),
                    }));
                  }}
                  required
                  className="rounded-sm"
                  placeholder="e.g. Dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-slug" className="font-bold uppercase tracking-wider text-sm">
                  Slug
                </Label>
                <Input
                  id="group-slug"
                  value={groupFormData.slug}
                  onChange={(e) =>
                    setGroupFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  className="rounded-sm"
                  placeholder="e.g. dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-order" className="font-bold uppercase tracking-wider text-sm">
                  Order
                </Label>
                <Input
                  id="group-order"
                  type="number"
                  value={groupFormData.order}
                  onChange={(e) =>
                    setGroupFormData((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  required
                  className="rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-icon" className="font-bold uppercase tracking-wider text-sm">
                  Icon
                </Label>
                <Select
                  value={groupFormData.icon}
                  onValueChange={(value) =>
                    setGroupFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger id="group-icon" className="rounded-sm">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {renderIcon(groupFormData.icon)}
                        <span>{groupFormData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-sm max-h-64">
                    {ICON_OPTIONS.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {renderIcon(iconName)}
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="group-isLink" className="font-bold uppercase tracking-wider text-sm">
                  Is Link
                </Label>
                <Switch
                  id="group-isLink"
                  checked={groupFormData.isLink}
                  onCheckedChange={(checked) =>
                    setGroupFormData((prev) => ({ ...prev, isLink: checked }))
                  }
                />
              </div>

              {groupFormData.isLink && (
                <div className="space-y-2">
                  <Label htmlFor="group-route" className="font-bold uppercase tracking-wider text-sm">
                    Route
                  </Label>
                  <Input
                    id="group-route"
                    value={groupFormData.route}
                    onChange={(e) =>
                      setGroupFormData((prev) => ({ ...prev, route: e.target.value }))
                    }
                    required={groupFormData.isLink}
                    className="rounded-sm"
                    placeholder="e.g. /dashboard"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGroupDialogOpen(false)}
                disabled={formLoading}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="rounded-sm">
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedGroup ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* Create/Edit Menu Item Dialog */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="rounded-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">
              {selectedItem ? "Edit Menu Item" : "Create Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-name" className="font-bold uppercase tracking-wider text-sm">
                  Name
                </Label>
                <Input
                  id="item-name"
                  value={itemFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setItemFormData((prev) => ({
                      ...prev,
                      name,
                      slug: selectedItem ? prev.slug : generateSlug(name),
                    }));
                  }}
                  required
                  className="rounded-sm"
                  placeholder="e.g. All Users"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-slug" className="font-bold uppercase tracking-wider text-sm">
                  Slug
                </Label>
                <Input
                  id="item-slug"
                  value={itemFormData.slug}
                  onChange={(e) =>
                    setItemFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                  className="rounded-sm"
                  placeholder="e.g. all-users"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-route" className="font-bold uppercase tracking-wider text-sm">
                  Route
                </Label>
                <Input
                  id="item-route"
                  value={itemFormData.route}
                  onChange={(e) =>
                    setItemFormData((prev) => ({ ...prev, route: e.target.value }))
                  }
                  required
                  className="rounded-sm"
                  placeholder="e.g. /users/all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-icon" className="font-bold uppercase tracking-wider text-sm">
                  Icon
                </Label>
                <Select
                  value={itemFormData.icon}
                  onValueChange={(value) =>
                    setItemFormData((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger id="item-icon" className="rounded-sm">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {renderIcon(itemFormData.icon)}
                        <span>{itemFormData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-sm max-h-64">
                    {ICON_OPTIONS.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {renderIcon(iconName)}
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedItem && (
                <div className="space-y-2">
                  <Label htmlFor="item-group" className="font-bold uppercase tracking-wider text-sm">
                    Group
                  </Label>
                  <Select
                    value={itemFormData.groupId}
                    onValueChange={(value) => {
                      setItemFormData((prev) => ({
                        ...prev,
                        groupId: value,
                        order: getNextItemOrder(value),
                      }));
                    }}
                  >
                    <SelectTrigger id="item-group" className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm">
                      {menuGroups.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="item-order" className="font-bold uppercase tracking-wider text-sm">
                  Order
                </Label>
                <Input
                  id="item-order"
                  type="number"
                  value={itemFormData.order}
                  onChange={(e) =>
                    setItemFormData((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  required
                  className="rounded-sm"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="item-isParent" className="font-bold uppercase tracking-wider text-sm">
                  Is Parent
                </Label>
                <Switch
                  id="item-isParent"
                  checked={itemFormData.isParent}
                  onCheckedChange={(checked) =>
                    setItemFormData((prev) => ({ ...prev, isParent: checked }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsItemDialogOpen(false)}
                disabled={formLoading}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="rounded-sm">
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedItem ? "Update Item" : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* Delete Confirmation Dialogs */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={isGroupDeleteDialogOpen}
        onOpenChange={setIsGroupDeleteDialogOpen}
        onConfirm={handleDeleteGroup}
        title="Delete Menu Group"
        description={`Are you sure you want to delete the menu group "${selectedGroup?.name}"? This will also delete all menu items in this group. This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />

      <ConfirmDialog
        open={isItemDeleteDialogOpen}
        onOpenChange={setIsItemDeleteDialogOpen}
        onConfirm={handleDeleteItem}
        title="Delete Menu Item"
        description={`Are you sure you want to delete the menu item "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
