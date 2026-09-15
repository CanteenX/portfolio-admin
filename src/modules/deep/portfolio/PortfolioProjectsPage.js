import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listPortfolioProjects,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  listTechStacks,
  listCategories,
  listYears,
  listClients,
  uploadPortfolioImage
} from "../../../shared/sdk";

const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:7002";

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_FORM = {
  slug: "", title: "", category: "", metric: "", year: "", image: "", client: "",
  timeframe: "", role: "", stack: [], techStack: [], liveUrl: "", githubUrl: "",
  problem: "", solution: "", features: [], gallery: [], roi: [],
  roiSectionDescription: "", screens: [], workflowSteps: [],
  stackSectionDescription: "", codeSnippet: null, architecture: "", isActive: true, order: 0
};

const ic = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";

// ── MultiSelect ───────────────────────────────────────────────────────────────

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(val) {
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      onChange([...selected, val]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className="truncate">
          {selected.length === 0
            ? <span className="text-muted-foreground">Select {label}...</span>
            : <span className="flex flex-wrap gap-1">
                {selected.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                    {s}
                    <span
                      className="cursor-pointer hover:text-red-400"
                      onMouseDown={e => { e.stopPropagation(); toggle(s); }}
                    >×</span>
                  </span>
                ))}
              </span>
          }
        </span>
        <svg className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-xl max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No options — add via masters</div>
          ) : options.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 text-sm">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="rounded" />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ImageUploadField ──────────────────────────────────────────────────────────

function ImageUploadField({ label, value, onChange, api }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setUploadErr(err); e.target.value = ""; return; }
    setUploading(true);
    setUploadErr(null);
    try {
      const url = await uploadPortfolioImage(api, file);
      onChange(url);
    } catch {
      setUploadErr("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="mt-1 flex items-center gap-3 flex-wrap">
        {value && (
          <div className="relative group">
            <img src={imgSrc(value)} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-border" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
            >×</button>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
        >
          {uploading ? "Uploading..." : value ? "Replace Image" : "Choose Image"}
        </button>
        {uploadErr && <span className="text-xs text-red-400">{uploadErr}</span>}
      </div>
    </div>
  );
}

// ── ArraySection ──────────────────────────────────────────────────────────────

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
            <button type="button" onClick={() => onRemove(i)} className="mt-1 text-red-400 hover:text-red-300 text-lg leading-none shrink-0">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GalleryUpload ─────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPEG, PNG, WebP, or GIF allowed";
  if (file.size > MAX_IMAGE_SIZE) return "File must be under 10 MB";
  return null;
}

function GalleryItem({ item, idx, api, onUpdate, onRemove }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setUploadErr(err); e.target.value = ""; return; }
    setUploading(true);
    setUploadErr(null);
    try {
      const url = await uploadPortfolioImage(api, file);
      onUpdate(idx, "src", url);
    } catch {
      setUploadErr("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="flex items-center gap-3">
        {item.src && <img src={imgSrc(item.src)} alt="gallery" className="w-16 h-12 object-cover rounded border border-border" />}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded border border-border text-xs hover:bg-muted disabled:opacity-50"
        >
          {uploading ? "Uploading..." : item.src ? "Replace" : "Choose Image"}
        </button>
        <button type="button" onClick={() => onRemove(idx)} className="ml-auto text-red-400 hover:text-red-300 text-sm">Remove</button>
      </div>
      {uploadErr && <span className="text-xs text-red-400">{uploadErr}</span>}
      <input
        className={ic}
        placeholder="Caption"
        value={item.caption}
        onChange={e => onUpdate(idx, "caption", e.target.value)}
      />
    </div>
  );
}

// ── ScreenItem ────────────────────────────────────────────────────────────────

function ScreenItem({ item, idx, api, onUpdate, onRemove }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setUploadErr(err); e.target.value = ""; return; }
    setUploading(true);
    setUploadErr(null);
    try {
      const url = await uploadPortfolioImage(api, file);
      onUpdate(idx, "image", url);
    } catch {
      setUploadErr("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="flex items-center gap-3">
        {item.image && <img src={imgSrc(item.image)} alt="screen" className="w-16 h-12 object-cover rounded border border-border" />}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded border border-border text-xs hover:bg-muted disabled:opacity-50"
        >
          {uploading ? "Uploading..." : item.image ? "Replace" : "Choose Image"}
        </button>
        <button type="button" onClick={() => onRemove(idx)} className="ml-auto text-red-400 hover:text-red-300 text-sm">Remove</button>
      </div>
      {uploadErr && <span className="text-xs text-red-400">{uploadErr}</span>}
      <div className="grid grid-cols-2 gap-2">
        <input className={ic} placeholder="Label (e.g. Home Screen)" value={item.label} onChange={e => onUpdate(idx, "label", e.target.value)} />
        <input className={ic} placeholder="Caption (short subtitle)" value={item.caption} onChange={e => onUpdate(idx, "caption", e.target.value)} />
      </div>
      <textarea className={`${ic} resize-none`} rows={2} placeholder="Description" value={item.description} onChange={e => onUpdate(idx, "description", e.target.value)} />
    </div>
  );
}

const ROI_ICONS = ["Clock", "TrendingUp", "Star", "Building2", "Zap", "CheckCircle2", "Shield", "Globe", "Award", "Users", "BarChart", "DollarSign", "Timer", "Rocket", "Target"];

// ── Main page ─────────────────────────────────────────────────────────────────

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
  const [slugManual, setSlugManual] = useState(false);
  const LIMIT = 20;

  // Masters data
  const [techStacks, setTechStacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);
  const [clients, setClients] = useState([]);

  async function loadMasters() {
    try {
      const [ts, cats, yrs, cls] = await Promise.all([
        listTechStacks(api),
        listCategories(api),
        listYears(api),
        listClients(api)
      ]);
      setTechStacks(ts);
      setCategories(cats);
      setYears(yrs);
      setClients(cls);
    } catch {
      // masters load failure is non-fatal
    }
  }

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

  useEffect(() => { loadMasters(); }, [api]);
  useEffect(() => { loadData(page); }, [page, api]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugManual(false);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setSlugManual(true);
    setForm({
      slug: item.slug,
      title: item.title,
      category: item.category,
      metric: item.metric ?? "",
      year: item.year ?? "",
      image: item.image ?? "",
      client: item.client ?? "",
      timeframe: item.timeframe ?? "",
      role: item.role ?? "",
      stack: item.stack ?? [],
      techStack: item.techStack ?? [],
      liveUrl: item.liveUrl ?? "",
      githubUrl: item.githubUrl ?? "",
      problem: item.problem ?? "",
      solution: item.solution ?? "",
      features: item.features ?? [],
      gallery: item.gallery ?? [],
      roi: (item.roi ?? []).map(r =>
        typeof r === "string" ? { value: r, label: "", description: "", icon: "" } : r
      ),
      roiSectionDescription: item.roiSectionDescription ?? "",
      screens: (item.screens ?? []),
      workflowSteps: (item.workflowSteps ?? []),
      stackSectionDescription: item.stackSectionDescription ?? "",
      codeSnippet: item.codeSnippet ?? null,
      architecture: item.architecture ?? "",
      isActive: item.isActive,
      order: item.order
    });
    setShowModal(true);
  }

  function setField(key, value) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugManual) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }

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

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        roi: form.roi.filter(r => r.value || r.label),
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
      loadData(page);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const techStackNames = techStacks.map(t => t.name);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{total} project{total !== 1 ? "s" : ""} total</p>
        </div>
        <RbacGate action="write"><button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          + Add Project
        </button></RbacGate>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

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
                  <RbacGate action="edit"><button onClick={() => openEdit(item)} className="text-xs text-blue-400 hover:text-blue-300 mr-3">Edit</button></RbacGate>
                  <RbacGate action="delete"><button onClick={() => handleDelete(item._id)} className="text-xs text-red-400 hover:text-red-300">Delete</button></RbacGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

              {/* Title & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
                  <input className={ic} required value={form.title} onChange={e => setField("title", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Slug *
                    {!slugManual && <span className="ml-2 text-emerald-500 normal-case font-normal">auto</span>}
                  </label>
                  <input
                    className={ic}
                    required
                    value={form.slug}
                    onChange={e => { setSlugManual(true); setField("slug", e.target.value); }}
                    placeholder="fintech-payments"
                  />
                </div>
              </div>

              {/* Category / Year / Client dropdowns */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category *</label>
                  <select className={ic} required value={form.category} onChange={e => setField("category", e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</label>
                  <select className={ic} value={form.year} onChange={e => setField("year", e.target.value)}>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y.year}>{y.year}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</label>
                  <select className={ic} value={form.client} onChange={e => setField("client", e.target.value)}>
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Metric / Timeframe / Role */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Metric</label>
                  <input className={ic} value={form.metric} onChange={e => setField("metric", e.target.value)} placeholder="$2M / day" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timeframe</label>
                  <input className={ic} value={form.timeframe} onChange={e => setField("timeframe", e.target.value)} placeholder="14 weeks · Q1 2024" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
                  <input className={ic} value={form.role} onChange={e => setField("role", e.target.value)} />
                </div>
              </div>

              {/* Cover Image */}
              <ImageUploadField
                label="Cover Image"
                value={form.image}
                onChange={url => setField("image", url)}
                api={api}
              />

              {/* Stack multiselect */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">Stack</label>
                <MultiSelect
                  label="stack"
                  options={techStackNames}
                  selected={form.stack}
                  onChange={val => setField("stack", val)}
                />
              </div>

              {/* Tech Stack multiselect */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-0.5">Tech Stack</label>
                <MultiSelect
                  label="tech stack"
                  options={techStackNames}
                  selected={form.techStack}
                  onChange={val => setField("techStack", val)}
                />
              </div>

              {/* Stack Section Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stack Section Description</label>
                <textarea className={`${ic} resize-none`} rows={2} value={form.stackSectionDescription} onChange={e => setField("stackSectionDescription", e.target.value)} placeholder="A robust pipeline ensuring 99.9% uptime..." />
              </div>

              {/* URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live URL</label>
                  <input className={ic} type="url" value={form.liveUrl} onChange={e => setField("liveUrl", e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GitHub URL</label>
                  <input className={ic} type="url" value={form.githubUrl} onChange={e => setField("githubUrl", e.target.value)} placeholder="https://github.com/..." />
                </div>
              </div>

              {/* Problem / Solution / Architecture */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Problem</label>
                <textarea className={`${ic} resize-none`} rows={3} value={form.problem} onChange={e => setField("problem", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Solution</label>
                <textarea className={`${ic} resize-none`} rows={3} value={form.solution} onChange={e => setField("solution", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Architecture</label>
                <textarea className={`${ic} resize-none`} rows={2} value={form.architecture} onChange={e => setField("architecture", e.target.value)} />
              </div>

              {/* ROI Section Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ROI Section Description</label>
                <textarea className={`${ic} resize-none`} rows={2} value={form.roiSectionDescription} onChange={e => setField("roiSectionDescription", e.target.value)} placeholder="We don't just ship code; we ship results..." />
              </div>

              {/* ROI — addable items */}
              <ArraySection
                label="ROI / Results"
                items={form.roi}
                onAdd={() => addArrayItem("roi", { value: "", label: "", description: "", icon: "" })}
                onRemove={i => removeArrayItem("roi", i)}
                renderItem={(item, i) => (
                  <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input className={ic} placeholder="Value (e.g. 15 min)" value={item.value ?? ""} onChange={e => updateArrayItem("roi", i, "value", e.target.value)} />
                      <input className={ic} placeholder="Label (e.g. Saved per meeting)" value={item.label ?? ""} onChange={e => updateArrayItem("roi", i, "label", e.target.value)} />
                      <select className={ic} value={item.icon ?? ""} onChange={e => updateArrayItem("roi", i, "icon", e.target.value)}>
                        <option value="">Icon (optional)</option>
                        {ROI_ICONS.map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                      </select>
                    </div>
                    <textarea className={`${ic} resize-none`} rows={2} placeholder="Description" value={item.description ?? ""} onChange={e => updateArrayItem("roi", i, "description", e.target.value)} />
                  </div>
                )}
              />

              {/* Features */}
              <ArraySection
                label="Features"
                items={form.features}
                onAdd={() => addArrayItem("features", { title: "", description: "" })}
                onRemove={i => removeArrayItem("features", i)}
                renderItem={(item, i) => (
                  <div className="grid grid-cols-2 gap-2">
                    <input className={ic} placeholder="Feature title" value={item.title} onChange={e => updateArrayItem("features", i, "title", e.target.value)} />
                    <input className={ic} placeholder="Description" value={item.description} onChange={e => updateArrayItem("features", i, "description", e.target.value)} />
                  </div>
                )}
              />

              {/* Gallery — file uploads */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gallery</label>
                  <button type="button" onClick={() => addArrayItem("gallery", { src: "", caption: "" })} className="text-xs text-primary hover:opacity-80">+ Add Image</button>
                </div>
                <div className="space-y-3">
                  {form.gallery.map((item, i) => (
                    <GalleryItem
                      key={i}
                      item={item}
                      idx={i}
                      api={api}
                      onUpdate={(idx, key, val) => updateArrayItem("gallery", idx, key, val)}
                      onRemove={idx => removeArrayItem("gallery", idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Screens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">App Screens</label>
                  <button type="button" onClick={() => addArrayItem("screens", { label: "", caption: "", description: "", image: "" })} className="text-xs text-primary hover:opacity-80">+ Add Screen</button>
                </div>
                <div className="space-y-3">
                  {form.screens.map((item, i) => (
                    <ScreenItem
                      key={i}
                      item={item}
                      idx={i}
                      api={api}
                      onUpdate={(idx, key, val) => updateArrayItem("screens", idx, key, val)}
                      onRemove={idx => removeArrayItem("screens", idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Workflow Steps */}
              <ArraySection
                label="Workflow Steps (How we built it)"
                items={form.workflowSteps}
                onAdd={() => addArrayItem("workflowSteps", { step: "", title: "", description: "" })}
                onRemove={i => removeArrayItem("workflowSteps", i)}
                renderItem={(item, i) => (
                  <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input className={ic} placeholder="Step (e.g. 01)" value={item.step ?? ""} onChange={e => updateArrayItem("workflowSteps", i, "step", e.target.value)} />
                      <input className={ic} placeholder="Title (e.g. The Mobile Edge)" value={item.title ?? ""} onChange={e => updateArrayItem("workflowSteps", i, "title", e.target.value)} />
                    </div>
                    <textarea className={`${ic} resize-none`} rows={2} placeholder="Description" value={item.description ?? ""} onChange={e => updateArrayItem("workflowSteps", i, "description", e.target.value)} />
                  </div>
                )}
              />

              {/* Order / Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</label>
                  <input type="number" className={ic} value={form.order} onChange={e => setField("order", e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setField("isActive", e.target.checked)} />
                  <label htmlFor="isActive" className="text-sm">Active (visible on website)</label>
                </div>
              </div>

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
