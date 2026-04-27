import {
  listTodoItems,
  createTodoItem,
  updateTodoItem,
  completeTodoItem,
  reopenTodoItem,
  deleteTodoItem,
  getTodoInsights
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { CheckSquare, Plus, AlertCircle } from "lucide-react";

export function TodoModulePage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);

  async function loadAll(targetPage = page) {
    setError(null);
    try {
      const [itemsResult, insightsResult] = await Promise.all([
        listTodoItems(api, { page: targetPage, limit }),
        getTodoInsights(api)
      ]);
      setItems(itemsResult.items);
      setPage(itemsResult.page);
      setTotal(itemsResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load todo items");
    }
  }

  useEffect(() => {
    void loadAll(page);
  }, [api, page]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await createTodoItem(api, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || undefined
      });
      setForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate: ""
      });
      await loadAll(1);
    } catch {
      setError("Failed to create todo item");
    }
  }

  async function handleComplete(itemId) {
    setError(null);
    try {
      await completeTodoItem(api, { itemId });
      await loadAll(page);
    } catch {
      setError("Failed to complete item");
    }
  }

  async function handleReopen(itemId) {
    setError(null);
    try {
      await reopenTodoItem(api, { itemId });
      await loadAll(page);
    } catch {
      setError("Failed to reopen item");
    }
  }

  async function handleDelete(itemId) {
    setError(null);
    try {
      await deleteTodoItem(api, { itemId });
      await loadAll(page);
    } catch {
      setError("Failed to delete item");
    }
  }

  async function handlePriorityChange(itemId, newPriority) {
    setError(null);
    try {
      await updateTodoItem(api, { itemId, priority: newPriority });
      await loadAll(page);
    } catch {
      setError("Failed to update priority");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="space-y-6">
      <Breadcrumb title="Todo" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Todo" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Pending</span>
              <span className="ml-2 font-bold">{insights.pending}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Completed</span>
              <span className="ml-2 font-bold">{insights.completed}</span>
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
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Todo Item</h3>
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
                <Label className="uppercase tracking-wider text-xs font-bold">Due Date</Label>
                <Input
                  type="date"
                  placeholder="Due Date"
                  value={form.dueDate}
                  onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Todo Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-2">Todo Items ({total})</h3>
      </div>

      {items.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No todo items found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.itemId} className="industrial-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold">{item.title}</div>
                  <Badge
                    variant={item.status === "pending" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  Priority:{" "}
                  <select
                    className="flex h-7 rounded-sm border border-input bg-transparent px-2 py-0.5 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={item.priority}
                    onChange={e => handlePriorityChange(item.itemId, e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                {item.description ? (
                  <p className="text-sm mt-2">{item.description}</p>
                ) : null}
                <div className="text-xs text-muted-foreground mt-2">
                  {item.dueDate ? `Due: ${item.dueDate}` : "No due date"}
                  {item.completedAt ? ` | Completed: ${new Date(item.completedAt).toLocaleString()}` : ""}
                </div>

                <div className="flex gap-2 mt-3">
                  {item.status === "pending" ? (
                    <Button variant="outline" size="sm" onClick={() => handleComplete(item.itemId)}>
                      Complete
                    </Button>
                  ) : null}
                  {item.status === "completed" ? (
                    <Button variant="outline" size="sm" onClick={() => handleReopen(item.itemId)}>
                      Reopen
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.itemId)}>
                    Delete
                  </Button>
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
