import {
  listTasks,
  createTask,
  updateTask,
  transitionTask,
  deleteTask,
  getTaskInsights
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ListChecks, Plus, AlertCircle } from "lucide-react";

export function TasksModulePage() {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeUserId: "",
    dueDate: "",
    projectId: "",
    tags: "",
    estimatedHours: ""
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);

  async function loadAll(targetPage = page) {
    setError(null);
    try {
      const [tasksResult, insightsResult] = await Promise.all([
        listTasks(api, { page: targetPage, limit }),
        getTaskInsights(api)
      ]);
      setTasks(tasksResult.items);
      setPage(tasksResult.page);
      setTotal(tasksResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load tasks");
    }
  }

  useEffect(() => {
    void loadAll(page);
  }, [api, page]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      const tagList = form.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      await createTask(api, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        assigneeUserId: form.assigneeUserId || undefined,
        dueDate: form.dueDate || undefined,
        projectId: form.projectId || undefined,
        tags: tagList,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined
      });
      setForm({
        title: "",
        description: "",
        priority: "medium",
        assigneeUserId: "",
        dueDate: "",
        projectId: "",
        tags: "",
        estimatedHours: ""
      });
      await loadAll(1);
    } catch {
      setError("Failed to create task");
    }
  }

  async function handleTransition(taskId, newStatus) {
    setError(null);
    try {
      await transitionTask(api, { taskId, newStatus });
      await loadAll(page);
    } catch {
      setError(`Failed to transition to ${newStatus}`);
    }
  }

  async function handlePriorityChange(taskId, newPriority) {
    setError(null);
    try {
      await updateTask(api, { taskId, priority: newPriority });
      await loadAll(page);
    } catch {
      setError("Failed to update priority");
    }
  }

  async function handleDelete(taskId) {
    setError(null);
    try {
      await deleteTask(api, { taskId });
      await loadAll(page);
    } catch {
      setError("Failed to delete task");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="space-y-6">
      <Breadcrumb title="Tasks" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Tasks" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Todo</span>
              <span className="ml-2 font-bold">{insights.todo}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">In Progress</span>
              <span className="ml-2 font-bold">{insights.in_progress}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Review</span>
              <span className="ml-2 font-bold">{insights.review}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Done</span>
              <span className="ml-2 font-bold">{insights.done}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Cancelled</span>
              <span className="ml-2 font-bold">{insights.cancelled}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Overdue</span>
              <span className="ml-2 font-bold">{insights.overdue}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total</span>
              <span className="ml-2 font-bold">{insights.total}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      <Card className="industrial-card">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Task</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Title</Label>
              <Input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Priority</Label>
                <select
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.priority}
                  onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Assignee User ID</Label>
                <Input
                  type="text"
                  placeholder="Assignee User ID"
                  value={form.assigneeUserId}
                  onChange={e => setForm(prev => ({ ...prev, assigneeUserId: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Due Date</Label>
                <Input
                  type="date"
                  placeholder="Due Date"
                  value={form.dueDate}
                  onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Project ID</Label>
                <Input
                  type="text"
                  placeholder="Project ID"
                  value={form.projectId}
                  onChange={e => setForm(prev => ({ ...prev, projectId: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Tags (comma-separated)</Label>
                <Input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={form.tags}
                  onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Estimated Hours"
                  value={form.estimatedHours}
                  onChange={e => setForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-2">Tasks ({total})</h3>
      </div>

      {tasks.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tasks found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.taskId} className="industrial-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold">{task.title}</div>
                  <div className="flex gap-1">
                    <Badge
                      variant={task.status === "in_progress" || task.status === "todo" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  Priority:{" "}
                  <select
                    className="flex h-7 rounded-sm border border-input bg-transparent px-2 py-0.5 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={task.priority}
                    onChange={e => handlePriorityChange(task.taskId, e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                {task.description ? (
                  <p className="text-sm mt-2">{task.description}</p>
                ) : null}
                <div className="text-xs text-muted-foreground mt-2">
                  {task.assigneeUserId ? `Assignee: ${task.assigneeUserId}` : "Unassigned"}
                  {task.dueDate ? ` | Due: ${task.dueDate}` : ""}
                  {task.projectId ? ` | Project: ${task.projectId}` : ""}
                  {task.estimatedHours ? ` | Est: ${task.estimatedHours}h` : ""}
                </div>
                {task.tags && task.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                ) : null}

                <div className="flex gap-2 mt-3 flex-wrap">
                  {task.status === "todo" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "in_progress")}>
                        Start
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleTransition(task.taskId, "cancelled")}>
                        Cancel
                      </Button>
                    </>
                  ) : null}
                  {task.status === "in_progress" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "review")}>
                        Review
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "todo")}>
                        Back to Todo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleTransition(task.taskId, "cancelled")}>
                        Cancel
                      </Button>
                    </>
                  ) : null}
                  {task.status === "review" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "done")}>
                        Done
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "in_progress")}>
                        Back to In Progress
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleTransition(task.taskId, "cancelled")}>
                        Cancel
                      </Button>
                    </>
                  ) : null}
                  {task.status === "done" ? (
                    <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "todo")}>
                      Reopen
                    </Button>
                  ) : null}
                  {task.status === "cancelled" ? (
                    <Button variant="outline" size="sm" onClick={() => handleTransition(task.taskId, "todo")}>
                      Reopen
                    </Button>
                  ) : null}
                  {task.status === "done" || task.status === "cancelled" ? (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(task.taskId)}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-3 pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
