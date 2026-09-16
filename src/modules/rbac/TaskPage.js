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
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pencil, Trash2, Plus, Loader2, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "DONE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

const STATUS_BADGE = { TODO: "outline", IN_PROGRESS: "secondary", DONE: "default" };
const PRIORITY_COLOR = { LOW: "text-blue-600", MEDIUM: "text-amber-600", HIGH: "text-destructive" };

function KanbanColumn({ title, tasks, onEdit, onDelete, canUpdate, canDelete: canDel }) {
  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
        <Badge variant="secondary" className="rounded-sm">{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="border-2 border-dashed rounded-sm p-4 text-center text-muted-foreground text-sm">Empty</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="border rounded-sm p-3 bg-card space-y-2 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm leading-tight">{task.title}</p>
                <div className="flex gap-1 shrink-0">
                  {canUpdate && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-6 w-6 p-0 rounded-sm">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                  {canDel && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(task)} className="h-6 w-6 p-0 rounded-sm text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                <span className="text-muted-foreground">{task.assignedTo?.employeeName ?? "Unassigned"}</span>
              </div>
              {task.dueDate && (
                <p className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const emptyForm = {
  title: "", description: "", status: "TODO", priority: "MEDIUM", assignedTo: "", dueDate: "",
};

export default function TaskPage() {
  const { api } = useAuth();

  const { write: canCreate, edit: canUpdate, delete: canDelete } = useRbacPagePermissions();

  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState("kanban");

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const taskParams = debouncedSearch ? { search: debouncedSearch } : {};
      const [tasksRes, assigneesRes] = await Promise.all([
        api.get("/api/v1/rbac/tasks", { params: taskParams }),
        api.get("/api/v1/rbac/tasks/assignees"),
      ]);
      setTasks(tasksRes.data);
      setAssignees(assigneesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [api, debouncedSearch]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const resetForm = () => { setForm(emptyForm); setSelected(null); };
  const openCreate = () => { resetForm(); setIsDialogOpen(true); };
  const openEdit = (task) => {
    setSelected(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?._id ?? task.assignedTo ?? "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setIsDialogOpen(true);
  };
  const openDelete = (task) => { setSelected(task); setIsDeleteOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (selected) {
        await api.put(`/api/v1/rbac/tasks/${selected._id}`, payload);
      } else {
        await api.post("/api/v1/rbac/tasks", payload);
      }
      await loadAll();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/api/v1/rbac/tasks/${selected._id}`);
      await loadAll();
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setFormLoading(false);
    }
  };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Task Management"
        items={[{ label: "Home", path: "/" }, { label: "RBAC" }, { label: "Tasks" }]}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-sm text-sm">{error}</div>
      )}

      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-bold uppercase tracking-wider">
            Tasks
            <span className="ml-2 text-sm font-normal text-muted-foreground">(Downward Assignment Only)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-sm overflow-hidden">
              {["kanban", "list"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors
                    ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            {canCreate && (
              <Button size="sm" onClick={openCreate} className="rounded-sm" disabled={assignees.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="rounded-sm pl-8 w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : view === "kanban" ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              <KanbanColumn title="To Do" tasks={tasksByStatus("TODO")} onEdit={openEdit} onDelete={openDelete} canUpdate={canUpdate} canDelete={canDelete} />
              <KanbanColumn title="In Progress" tasks={tasksByStatus("IN_PROGRESS")} onEdit={openEdit} onDelete={openDelete} canUpdate={canUpdate} canDelete={canDelete} />
              <KanbanColumn title="Done" tasks={tasksByStatus("DONE")} onEdit={openEdit} onDelete={openDelete} canUpdate={canUpdate} canDelete={canDelete} />
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No tasks found</div>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between border rounded-sm p-3 hover:bg-muted/20 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm">{task.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>→ {task.assignedTo?.employeeName ?? "Unassigned"}</span>
                        {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                      <Badge variant={STATUS_BADGE[task.status]} className="rounded-sm text-xs">{task.status.replace("_", " ")}</Badge>
                      {canUpdate && (
                        <Button variant="ghost" size="sm" onClick={() => openEdit(task)} className="h-8 w-8 p-0 rounded-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="sm" onClick={() => openDelete(task)} className="h-8 w-8 p-0 rounded-sm text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold uppercase tracking-wider">{selected ? "Edit Task" : "Assign Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-wider text-xs">Title</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="rounded-sm" placeholder="Task title" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-wider text-xs">Description</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full min-h-[80px] rounded-sm border border-input px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-sm">
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                    <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-sm">
                      {PRIORITY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {!selected && (
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-wider text-xs">
                      Assign To <span className="text-muted-foreground font-normal">(sub-employees only)</span>
                    </Label>
                    <Select value={form.assignedTo || "none"} onValueChange={(v) => setForm((p) => ({ ...p, assignedTo: v === "none" ? "" : v }))}>
                      <SelectTrigger className="rounded-sm"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                      <SelectContent className="rounded-sm">
                        {assignees.length === 0 ? (
                          <SelectItem value="none" disabled>No sub-employees available</SelectItem>
                        ) : (
                          assignees.map((a) => (
                            <SelectItem key={a._id} value={a._id}>
                              {a.employeeName} — {a.department || a.emailOffice}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs">Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="rounded-sm" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={formLoading} className="rounded-sm">Cancel</Button>
              <Button type="submit" disabled={formLoading || (!selected && !form.assignedTo)} className="rounded-sm">
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selected ? "Update Task" : "Assign Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Delete task "${selected?.title}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={formLoading}
      />
    </div>
  );
}
