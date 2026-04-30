import React, { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listCategories, createCategory, updateCategory, deleteCategory,
  listYears, createYear, updateYear, deleteYear,
  listClients, createClient, updateClient, deleteClient
} from "../../../shared/sdk";

const ic = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

const TABS = ["Categories", "Years", "Clients"];

// ── Generic simple master list ────────────────────────────────────────────────

function SimpleMaster({ load, create, update, remove, labelField, inputLabel, inputPlaceholder }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValue, setFormValue] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      setItems(await load());
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  function openCreate() { setEditing(null); setFormValue(""); setFormOrder(0); setFormActive(true); setShowModal(true); }
  function openEdit(item) {
    setEditing(item);
    setFormValue(item[labelField]);
    setFormOrder(item.order);
    setFormActive(item.isActive);
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { [labelField]: formValue.trim(), order: Number(formOrder) || 0, isActive: formActive };
      if (editing) {
        await update(editing._id, payload);
      } else {
        await create(payload);
      }
      setShowModal(false);
      reload();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    try {
      await remove(id);
      reload();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="ml-auto">
          <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            + Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{inputLabel}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No items yet.</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="border-b border-border hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{item[labelField]}</td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? `Edit ${inputLabel}` : `New ${inputLabel}`}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{inputLabel} *</label>
                <input className={ic} required value={formValue} onChange={e => setFormValue(e.target.value)} placeholder={inputPlaceholder} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</label>
                  <input type="number" className={ic} value={formOrder} onChange={e => setFormOrder(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="smActive" checked={formActive} onChange={e => setFormActive(e.target.checked)} />
                  <label htmlFor="smActive" className="text-sm">Active</label>
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

// ── Main page ─────────────────────────────────────────────────────────────────

export function PortfolioMastersPage() {
  const { api } = useAuth();
  const [tab, setTab] = useState(0);

  const tabContent = [
    <SimpleMaster
      key="cat"
      load={() => listCategories(api)}
      create={(p) => createCategory(api, p)}
      update={(id, p) => updateCategory(api, id, p)}
      remove={(id) => deleteCategory(api, id)}
      labelField="name"
      inputLabel="Category"
      inputPlaceholder="Web Apps"
    />,
    <SimpleMaster
      key="year"
      load={() => listYears(api)}
      create={(p) => createYear(api, p)}
      update={(id, p) => updateYear(api, id, p)}
      remove={(id) => deleteYear(api, id)}
      labelField="year"
      inputLabel="Year"
      inputPlaceholder="2024"
    />,
    <SimpleMaster
      key="client"
      load={() => listClients(api)}
      create={(p) => createClient(api, p)}
      update={(id, p) => updateClient(api, id, p)}
      remove={(id) => deleteClient(api, id)}
      labelField="name"
      inputLabel="Client"
      inputPlaceholder="Acme Corp"
    />
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio Masters</div>
        <h1 className="text-2xl font-bold">Categories / Years / Clients</h1>
      </div>

      <div className="flex gap-1 mb-6 p-1 bg-muted/30 border border-border rounded-xl w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tabContent[tab]}
    </div>
  );
}
