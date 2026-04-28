import React, { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listPortfolioTeam,
  createPortfolioMember,
  updatePortfolioMember,
  deletePortfolioMember
} from "../../../shared/sdk";

const EMPTY_FORM = {
  id: "", slug: "", name: "", role: "", avatar: "", glow: "#ffffff",
  accent: "from-white to-gray-400", power: "", bio: "",
  personal: { location: "", email: "", languages: [] },
  skills: [], education: [], experience: [], projects: [], certificates: [],
  socials: { github: "", linkedin: "", portfolio: "" },
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

  useEffect(() => { loadData(page); }, [page]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }

  function openEdit(item) {
    setEditing(item);
    setForm({
      id: item.id, slug: item.slug, name: item.name, role: item.role,
      avatar: item.avatar, glow: item.glow, accent: item.accent,
      power: item.power, bio: item.bio,
      personal: item.personal ?? { location: "", email: "", languages: [] },
      skills: item.skills ?? [], education: item.education ?? [],
      experience: item.experience ?? [], projects: item.projects ?? [],
      certificates: item.certificates ?? [],
      socials: item.socials ?? { github: "", linkedin: "", portfolio: "" },
      isActive: item.isActive, order: item.order
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
        personal: {
          ...form.personal,
          languages: typeof form.personal.languages === "string"
            ? form.personal.languages.split(",").map(s => s.trim()).filter(Boolean)
            : form.personal.languages
        },
        order: Number(form.order) || 0
      };
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

  function setField(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function setPersonal(key, value) { setForm(prev => ({ ...prev, personal: { ...prev.personal, [key]: value } })); }
  function setSocials(key, value) { setForm(prev => ({ ...prev, socials: { ...prev.socials, [key]: value } })); }

  function addItem(key, template) { setForm(prev => ({ ...prev, [key]: [...(prev[key] ?? []), template] })); }
  function removeItem(key, idx) { setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) })); }
  function updateItem(key, idx, subKey, value) {
    setForm(prev => ({ ...prev, [key]: prev[key].map((item, i) => i === idx ? { ...item, [subKey]: value } : item) }));
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
        <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          + Add Member
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No team members yet.</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.avatar && <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover" />}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.role}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.id}</td>
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
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? "Edit Member" : "New Team Member"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <F label="ID *" value={form.id} onChange={v => setField("id", v)} required placeholder="FC-001" />
                <F label="Slug *" value={form.slug} onChange={v => setField("slug", v)} required placeholder="priya-raman" />
                <F label="Name *" value={form.name} onChange={v => setField("name", v)} required />
                <F label="Role *" value={form.role} onChange={v => setField("role", v)} required />
                <F label="Avatar URL" value={form.avatar} onChange={v => setField("avatar", v)} className="col-span-2" />
                <F label="Glow Color" value={form.glow} onChange={v => setField("glow", v)} placeholder="#34d399" />
                <F label="Accent Classes" value={form.accent} onChange={v => setField("accent", v)} placeholder="from-emerald-400 to-cyan-400" />
                <F label="Power Statement" value={form.power} onChange={v => setField("power", v)} className="col-span-2" />
                <F label="Order" type="number" value={form.order} onChange={v => setField("order", v)} />
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={form.isActive} onChange={e => setField("isActive", e.target.checked)} className="rounded" id="isActiveMember" />
                  <label htmlFor="isActiveMember" className="text-sm">Active</label>
                </div>
              </div>

              <TA label="Bio" value={form.bio} onChange={v => setField("bio", v)} rows={3} />

              <div className="grid grid-cols-3 gap-4">
                <F label="Location" value={form.personal.location} onChange={v => setPersonal("location", v)} />
                <F label="Email" value={form.personal.email} onChange={v => setPersonal("email", v)} />
                <div>
                  <label className={labelClass}>Languages (comma-sep)</label>
                  <input className={inputClass} value={Array.isArray(form.personal.languages) ? form.personal.languages.join(", ") : form.personal.languages} onChange={e => setPersonal("languages", e.target.value)} placeholder="English, Hindi" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <F label="GitHub URL" value={form.socials.github} onChange={v => setSocials("github", v)} />
                <F label="LinkedIn URL" value={form.socials.linkedin} onChange={v => setSocials("linkedin", v)} />
                <F label="Portfolio URL" value={form.socials.portfolio} onChange={v => setSocials("portfolio", v)} />
              </div>

              {/* Skills */}
              <Arr label="Skills" items={form.skills} onAdd={() => addItem("skills", { name: "", level: 80 })} onRemove={i => removeItem("skills", i)}
                renderItem={(item, i) => (
                  <div className="flex gap-2">
                    <input className={inputClass} placeholder="Skill name" value={item.name} onChange={e => updateItem("skills", i, "name", e.target.value)} />
                    <input className={inputClass} type="number" min="0" max="100" placeholder="Level" value={item.level} onChange={e => updateItem("skills", i, "level", Number(e.target.value))} style={{ width: 90 }} />
                  </div>
                )} />

              {/* Experience */}
              <Arr label="Experience" items={form.experience} onAdd={() => addItem("experience", { period: "", role: "", company: "", desc: "" })} onRemove={i => removeItem("experience", i)}
                renderItem={(item, i) => (
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputClass} placeholder="Period" value={item.period} onChange={e => updateItem("experience", i, "period", e.target.value)} />
                    <input className={inputClass} placeholder="Role" value={item.role} onChange={e => updateItem("experience", i, "role", e.target.value)} />
                    <input className={inputClass} placeholder="Company" value={item.company} onChange={e => updateItem("experience", i, "company", e.target.value)} />
                    <input className={inputClass} placeholder="Description" value={item.desc} onChange={e => updateItem("experience", i, "desc", e.target.value)} />
                  </div>
                )} />

              {/* Education */}
              <Arr label="Education" items={form.education} onAdd={() => addItem("education", { year: "", degree: "", school: "" })} onRemove={i => removeItem("education", i)}
                renderItem={(item, i) => (
                  <div className="grid grid-cols-3 gap-2">
                    <input className={inputClass} placeholder="Year" value={item.year} onChange={e => updateItem("education", i, "year", e.target.value)} />
                    <input className={inputClass} placeholder="Degree" value={item.degree} onChange={e => updateItem("education", i, "degree", e.target.value)} />
                    <input className={inputClass} placeholder="School" value={item.school} onChange={e => updateItem("education", i, "school", e.target.value)} />
                  </div>
                )} />

              {/* Certificates */}
              <Arr label="Certificates" items={form.certificates} onAdd={() => addItem("certificates", { title: "" })} onRemove={i => removeItem("certificates", i)}
                renderItem={(item, i) => (
                  <input className={inputClass} placeholder="Certificate title" value={item.title} onChange={e => updateItem("certificates", i, "title", e.target.value)} />
                )} />

              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>}

              <div className="flex justify-end gap-3 pt-2">
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

function F({ label, value, onChange, className = "", type = "text", required = false, placeholder = "" }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input type={type} className={inputClass} value={value ?? ""} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
    </div>
  );
}

function TA({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea className={`${inputClass} resize-none`} rows={rows} value={value ?? ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Arr({ label, items, onAdd, onRemove, renderItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelClass}>{label}</label>
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
