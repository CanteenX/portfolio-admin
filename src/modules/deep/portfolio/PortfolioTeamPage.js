import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listPortfolioTeam,
  createPortfolioMember,
  updatePortfolioMember,
  deletePortfolioMember,
  uploadPortfolioImage
} from "../../../shared/sdk";

const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:7002";

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPEG, PNG, WebP, or GIF allowed";
  if (file.size > MAX_IMAGE_SIZE) return "File must be under 10 MB";
  return null;
}

function AvatarUploadField({ value, onChange, api }) {
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
      setUploadErr("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className={labelClass}>Avatar Photo</label>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="mt-1 flex items-center gap-3 flex-wrap">
        {value && (
          <div className="relative group">
            <img src={imgSrc(value)} alt="avatar" className="w-14 h-14 object-cover rounded-full border border-border" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center"
            >×</button>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
        >
          {uploading ? "Uploading..." : value ? "Replace Photo" : "Choose Photo"}
        </button>
        {uploadErr && <span className="text-xs text-red-400">{uploadErr}</span>}
      </div>
    </div>
  );
}

function toSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

const EMPTY_FORM = {
  slug: "", name: "", role: "", avatar: "", power: "",
  socials: { github: "", linkedin: "" },
  isActive: true, order: 0
};

export function PortfolioTeamPage() {
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

  async function loadData(p = 1) {
    setLoading(true);
    setError(null);
    try {
      const result = await listPortfolioTeam(api, { page: p, limit: LIMIT });
      setItems(result.items);
      setTotal(result.total);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load team");
    } finally {
      setLoading(false);
    }
  }

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
      slug: item.slug ?? "",
      name: item.name ?? "",
      role: item.role ?? "",
      avatar: item.avatar ?? "",
      power: item.power ?? "",
      socials: {
        github: item.socials?.github ?? "",
        linkedin: item.socials?.linkedin ?? ""
      },
      isActive: item.isActive,
      order: item.order ?? 0
    });
    setShowModal(true);
  }

  function setField(key, value) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugManual) next.slug = toSlug(value);
      return next;
    });
  }

  function setSocials(key, value) {
    setForm(prev => ({ ...prev, socials: { ...prev.socials, [key]: value } }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) await updatePortfolioMember(api, editing._id, payload);
      else await createPortfolioMember(api, payload);
      setShowModal(false);
      loadData(page);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this team member?")) return;
    try {
      await deletePortfolioMember(api, id);
      loadData(page);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-sm text-gray-500 mt-1">{total} member{total !== 1 ? "s" : ""} total</p>
        </div>
        <RbacGate action="write"><button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          + Add Member
        </button></RbacGate>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No team members yet.</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.avatar
                      ? <img src={imgSrc(item.avatar)} alt={item.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">{item.name?.[0]}</div>
                    }
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.role}</td>
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
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? "Edit Member" : "New Team Member"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Avatar */}
              <AvatarUploadField value={form.avatar} onChange={v => setField("avatar", v)} api={api} />

              {/* Name & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input
                    className={inputClass}
                    required
                    value={form.name}
                    onChange={e => { setSlugManual(false); setField("name", e.target.value); }}
                    placeholder="Krish Modi"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Slug *
                    {!slugManual && <span className="ml-2 text-emerald-500 normal-case font-normal">auto</span>}
                  </label>
                  <input
                    className={inputClass}
                    required
                    value={form.slug}
                    onChange={e => { setSlugManual(true); setField("slug", e.target.value); }}
                    placeholder="krish-modi"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>Role *</label>
                <input className={inputClass} required value={form.role} onChange={e => setField("role", e.target.value)} placeholder="Backend / Cloud Lead" />
              </div>

              {/* Power tagline */}
              <div>
                <label className={labelClass}>Tagline</label>
                <input className={inputClass} value={form.power} onChange={e => setField("power", e.target.value)} placeholder="Designs distributed systems that don't fall over at peak traffic." />
              </div>

              {/* Socials */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>LinkedIn URL</label>
                  <input className={inputClass} type="url" value={form.socials.linkedin} onChange={e => setSocials("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className={labelClass}>GitHub URL</label>
                  <input className={inputClass} type="url" value={form.socials.github} onChange={e => setSocials("github", e.target.value)} placeholder="https://github.com/..." />
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className={labelClass}>Display Order</label>
                  <input type="number" className={inputClass} value={form.order} onChange={e => setField("order", e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <input type="checkbox" id="isActiveMember" checked={form.isActive} onChange={e => setField("isActive", e.target.checked)} className="rounded" />
                  <label htmlFor="isActiveMember" className="text-sm">Active (visible on site)</label>
                </div>
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>}

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";
const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wider";
