import React, { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listPortfolioProjects,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject
} from "../../../shared/sdk";

const EMPTY_FORM = {
  slug: "", title: "", category: "", metric: "", year: "", image: "", client: "",
  timeframe: "", role: "", stack: [], techStack: [], liveUrl: "", githubUrl: "",
  problem: "", solution: "", features: [], gallery: [], roi: [],
  codeSnippet: null, architecture: "", isActive: true, order: 0
};

export function PortfolioProjectsPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const LIMIT = 20;

  async function loadData(p = 1) {
    setLoading(true);
    setError(null);
    try {
      const result = await listPortfolioProjects(api, { page: p, limit: LIMIT });
      setItems(result.items);
      setTotal(result.total);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(page); }, [page]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      slug: item.slug, title: item.title, category: item.category,
      metric: item.metric, year: item.year, image: item.image,
      client: item.client, timeframe: item.timeframe, role: item.role,
      stack: item.stack ?? [], techStack: item.techStack ?? [],
      liveUrl: item.liveUrl ?? "", githubUrl: item.githubUrl ?? "",
      problem: item.problem, solution: item.solution,
      features: item.features ?? [], gallery: item.gallery ?? [],
      roi: item.roi ?? [], codeSnippet: item.codeSnippet ?? null,
      architecture: item.architecture ?? "", isActive: item.isActive,
      order: item.order
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        stack: typeof form.stack === "string" ? form.stack.split(",").map(s => s.trim()).filter(Boolean) : form.stack,
        techStack: typeof form.techStack === "string" ? form.techStack.split(",").map(s => s.trim()).filter(Boolean) : form.techStack,
        roi: typeof form.roi === "string" ? form.roi.split("\n").map(s => s.trim()).filter(Boolean) : form.roi,
        order: Number(form.order) || 0
      };
      if (editing) {
        await updatePortfolioProject(api, editing._id, payload);
      } else {
        await createPortfolioProject(api, payload);
      }
      setShowModal(false);
      loadData(page);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deletePortfolioProject(api, id);
      setDeleteId(null);
      loadData(page);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // ── Array helpers ─────────────────────────────────────────────────────────

  function addArrayItem(key, template) {
    setForm(prev => ({ ...prev, [key]: [...(prev[key] ?? []), template] }));
  }

  function removeArrayItem(key, idx) {
    setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  }

  function updateArrayItem(key, idx, subKey, value) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) => i === idx ? { ...item, [subKey]: value } : item)
    }));
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{total} project{total !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          + Add Project
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Year</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No projects yet. Click "+ Add Project" to create one.</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.year}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.order}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {item.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="text-xs text-blue-400 hover:text-blue-300 mr-3">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title *" value={form.title} onChange={v => setField("title", v)} required />
                <Field label="Slug *" value={form.slug} onChange={v => setField("slug", v)} required placeholder="fintech-payments" />
                <Field label="Category *" value={form.category} onChange={v => setField("category", v)} required placeholder="Web Apps" />
                <Field label="Year" value={form.year} onChange={v => setField("year", v)} placeholder="2024" />
                <Field label="Metric" value={form.metric} onChange={v => setField("metric", v)} placeholder="$2M / day processed" />
                <Field label="Client" value={form.client} onChange={v => setField("client", v)} />
                <Field label="Timeframe" value={form.timeframe} onChange={v => setField("timeframe", v)} placeholder="14 weeks · Q1 2024" />
                <Field label="Role" value={form.role} onChange={v => setField("role", v)} />
                <Field label="Cover Image URL" value={form.image} onChange={v => setField("image", v)} className="col-span-2" />
                <Field label="Live URL" value={form.liveUrl} onChange={v => setField("liveUrl", v)} />
                <Field label="GitHub URL" value={form.githubUrl} onChange={v => setField("githubUrl", v)} />
                <Field label="Order" type="number" value={form.order} onChange={v => setField("order", v)} />
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setField("isActive", e.target.checked)} className="rounded" />
                  <label htmlFor="isActive" className="text-sm">Active (visible on website)</label>
                </div>
              </div>

              {/* Stack */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stack (comma-separated)</label>
                <input className={inputClass} value={Array.isArray(form.stack) ? form.stack.join(", ") : form.stack} onChange={e => setField("stack", e.target.value)} placeholder="Node.js, TypeScript, PostgreSQL" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tech Stack (comma-separated)</label>
                <input className={inputClass} value={Array.isArray(form.techStack) ? form.techStack.join(", ") : form.techStack} onChange={e => setField("techStack", e.target.value)} placeholder="React, Next.js, TailwindCSS" />
              </div>

              {/* Problem / Solution */}
              <TextArea label="Problem" value={form.problem} onChange={v => setField("problem", v)} rows={3} />
              <TextArea label="Solution" value={form.solution} onChange={v => setField("solution", v)} rows={3} />
              <TextArea label="Architecture" value={form.architecture} onChange={v => setField("architecture", v)} rows={2} />

              {/* ROI */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ROI / Results (one per line)</label>
                <textarea className={`${inputClass} resize-none`} rows={4} value={Array.isArray(form.roi) ? form.roi.join("\n") : form.roi} onChange={e => setField("roi", e.target.value)} placeholder="Settlement time reduced from 8s to 320ms&#10;$2M+ processed daily" />
              </div>

              {/* Features */}
              <ArraySection
                label="Features"
                items={form.features}
                onAdd={() => addArrayItem("features", { title: "", description: "" })}
                onRemove={i => removeArrayItem("features", i)}
                renderItem={(item, i) => (
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputClass} placeholder="Feature title" value={item.title} onChange={e => updateArrayItem("features", i, "title", e.target.value)} />
                    <input className={inputClass} placeholder="Description" value={item.description} onChange={e => updateArrayItem("features", i, "description", e.target.value)} />
                  </div>
                )}
              />

              {/* Gallery */}
              <ArraySection
                label="Gallery"
                items={form.gallery}
                onAdd={() => addArrayItem("gallery", { src: "", caption: "" })}
                onRemove={i => removeArrayItem("gallery", i)}
                renderItem={(item, i) => (
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputClass} placeholder="Image URL" value={item.src} onChange={e => updateArrayItem("gallery", i, "src", e.target.value)} />
                    <input className={inputClass} placeholder="Caption" value={item.caption} onChange={e => updateArrayItem("gallery", i, "caption", e.target.value)} />
                  </div>
                )}
              />

              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable sub-components ─────────────────────────────────────────────────

const inputClass = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";

function Field({ label, value, onChange, className = "", type = "text", required = false, placeholder = "" }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input type={type} className={inputClass} value={value ?? ""} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <textarea className={`${inputClass} resize-none`} rows={rows} value={value ?? ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ArraySection({ label, items, onAdd, onRemove, renderItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
        <button type="button" onClick={onAdd} className="text-xs text-primary hover:opacity-80">+ Add</button>
      </div>
      <div className="space-y-2">
        {(items ?? []).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">{renderItem(item, i)}</div>
            <button type="button" onClick={() => onRemove(i)} className="mt-1 text-red-400 hover:text-red-300 text-lg leading-none flex-shrink-0">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
