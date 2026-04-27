import {
  listProjects,
  createProject,
  updateProject,
  transitionProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectInsights
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { AlertCircle, FolderKanban, Plus, X } from "lucide-react";

export function ProjectsModulePage() {
  const { api } = useAuth();
  const [projects, setProjects] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    priority: "medium",
    startDate: "",
    targetEndDate: "",
    tags: ""
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [memberForm, setMemberForm] = useState({});

  async function loadAll(targetPage = page) {
    setError(null);
    try {
      const [projectsResult, insightsResult] = await Promise.all([
        listProjects(api, { page: targetPage, limit }),
        getProjectInsights(api)
      ]);
      setProjects(projectsResult.items);
      setPage(projectsResult.page);
      setTotal(projectsResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load projects");
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
      await createProject(api, {
        name: form.name,
        description: form.description,
        priority: form.priority,
        startDate: form.startDate || undefined,
        targetEndDate: form.targetEndDate || undefined,
        tags: tagList
      });
      setForm({
        name: "",
        description: "",
        priority: "medium",
        startDate: "",
        targetEndDate: "",
        tags: ""
      });
      await loadAll(1);
    } catch {
      setError("Failed to create project");
    }
  }

  async function handleTransition(projectId, newStatus) {
    setError(null);
    try {
      await transitionProject(api, { projectId, newStatus });
      await loadAll(page);
    } catch {
      setError(`Failed to transition to ${newStatus}`);
    }
  }

  async function handleDelete(projectId) {
    setError(null);
    try {
      await deleteProject(api, { projectId });
      await loadAll(page);
    } catch {
      setError("Failed to delete project");
    }
  }

  async function handleAddMember(projectId) {
    setError(null);
    const userId = memberForm[projectId]?.userId;
    const role = memberForm[projectId]?.role || "member";
    if (!userId) {
      setError("User ID is required");
      return;
    }
    try {
      await addProjectMember(api, { projectId, userId, role });
      setMemberForm(prev => ({ ...prev, [projectId]: { userId: "", role: "member" } }));
      await loadAll(page);
    } catch {
      setError("Failed to add member");
    }
  }

  async function handleRemoveMember(projectId, userId) {
    setError(null);
    try {
      await removeProjectMember(api, { projectId, userId });
      await loadAll(page);
    } catch {
      setError("Failed to remove member");
    }
  }

  function setMemberUserId(projectId, userId) {
    setMemberForm(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], userId }
    }));
  }

  function setMemberRole(projectId, role) {
    setMemberForm(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], role }
    }));
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="space-y-6">
      <Breadcrumb title="Projects" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Projects" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Planning</span>
              <span className="ml-2 font-bold">{insights.planning}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Active</span>
              <span className="ml-2 font-bold">{insights.active}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">On Hold</span>
              <span className="ml-2 font-bold">{insights.on_hold}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Completed</span>
              <span className="ml-2 font-bold">{insights.completed}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Archived</span>
              <span className="ml-2 font-bold">{insights.archived}</span>
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
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Project</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Name</Label>
              <Input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Start Date</Label>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={form.startDate}
                  onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Target End Date</Label>
                <Input
                  type="date"
                  placeholder="Target End Date"
                  value={form.targetEndDate}
                  onChange={e => setForm(prev => ({ ...prev, targetEndDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Tags (comma-separated)</Label>
              <Input
                type="text"
                placeholder="Tags (comma-separated)"
                value={form.tags}
                onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">
          Projects ({total})
        </h3>

        {projects.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No projects found</p>
            </CardContent>
          </Card>
        ) : (
          projects.map(proj => (
            <Card key={proj.projectId} className="industrial-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base">{proj.name}</span>
                  <Badge variant="secondary" className="text-xs">{proj.status}</Badge>
                  <Badge variant="secondary" className="text-xs">{proj.priority}</Badge>
                </div>

                {proj.description ? (
                  <p className="text-sm text-muted-foreground">{proj.description}</p>
                ) : null}

                <div className="text-xs text-muted-foreground">
                  {proj.startDate ? `Start: ${proj.startDate}` : ""}
                  {proj.targetEndDate ? ` | Target End: ${proj.targetEndDate}` : ""}
                  {proj.actualEndDate ? ` | Actual End: ${proj.actualEndDate}` : ""}
                </div>

                {proj.tags && proj.tags.length > 0 ? (
                  <div className="flex gap-1 flex-wrap">
                    {proj.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                ) : null}

                {proj.members && proj.members.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Members</span>
                    <div className="flex flex-wrap gap-2">
                      {proj.members.map(member => (
                        <Badge key={member.userId} variant="secondary" className="text-xs flex items-center gap-1">
                          {member.userId} ({member.role})
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(proj.projectId, member.userId)}
                            className="ml-1 text-destructive hover:text-destructive/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2 flex-wrap">
                  {proj.status === "planning" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "active")}>
                        Activate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "archived")}>
                        Archive
                      </Button>
                    </>
                  ) : null}
                  {proj.status === "active" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "on_hold")}>
                        Hold
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "completed")}>
                        Complete
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "archived")}>
                        Archive
                      </Button>
                    </>
                  ) : null}
                  {proj.status === "on_hold" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "active")}>
                        Activate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "archived")}>
                        Archive
                      </Button>
                    </>
                  ) : null}
                  {proj.status === "completed" ? (
                    <Button variant="outline" size="sm" onClick={() => handleTransition(proj.projectId, "archived")}>
                      Archive
                    </Button>
                  ) : null}
                  {proj.status === "archived" ? (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(proj.projectId)}>
                      Delete
                    </Button>
                  ) : null}
                </div>

                <div className="border-t border-border pt-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Add Member</span>
                  <div className="flex gap-2 items-center mt-2">
                    <Input
                      type="text"
                      placeholder="User ID"
                      className="flex-1"
                      value={memberForm[proj.projectId]?.userId || ""}
                      onChange={e => setMemberUserId(proj.projectId, e.target.value)}
                    />
                    <select
                      className="flex h-9 w-auto rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={memberForm[proj.projectId]?.role || "member"}
                      onChange={e => setMemberRole(proj.projectId, e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="lead">Lead</option>
                      <option value="owner">Owner</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => handleAddMember(proj.projectId)}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center gap-3 pt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
