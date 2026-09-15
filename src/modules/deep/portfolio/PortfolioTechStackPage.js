import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listTechStacks,
  createTechStack,
  updateTechStack,
  deleteTechStack,
  uploadPortfolioImage
} from "../../../shared/sdk";

const EMPTY = { name: "", image: "", description: "", isActive: true, order: 0 };
const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:7002";

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

export function PortfolioTechStackPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await listTechStacks(api));
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(item) { setEditing(item); setForm({ name: item.name, image: item.image, description: item.description, isActive: item.isActive, order: item.order }); setShowModal(true); }

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPortfolioImage(api, file);
      setForm(prev => ({ ...prev, image: url }));
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) {
        await updateTechStack(api, editing._id, payload);
      } else {
        await createTechStack(api, payload);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this tech stack?")) return;
    try {
      await deleteTechStack(api, id);
      load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  const ic = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio Masters</div>
          <h1 className="text-2xl font-bold">Tech Stack</h1>
        </div>
        <RbacGate action="write"><button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          + Add Tech Stack
        </button></RbacGate>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Image</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No tech stacks yet.</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-border hover:bg-muted/20">
                <td className="px-4 py-3">
                  {item.image ? <img src={imgSrc(item.image)} alt={item.name} className="w-10 h-10 rounded object-contain bg-muted" /> : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">—</div>}
                </td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{item.description}</td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? "Edit Tech Stack" : "New Tech Stack"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name *</label>
                <input className={ic} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="React" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Logo Image</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                <div className="mt-1 flex items-center gap-3">
                  {form.image && <img src={imgSrc(form.image)} alt="preview" className="w-12 h-12 rounded object-contain bg-muted border border-border" />}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50">
                    {uploading ? "Uploading..." : "Choose Image"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea className={`${ic} resize-none`} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</label>
                  <input type="number" className={ic} value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="tsActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <label htmlFor="tsActive" className="text-sm">Active</label>
                </div>
              </div>
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
