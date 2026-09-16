import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listPortfolioServices,
  createPortfolioService,
  updatePortfolioService,
  deletePortfolioService
} from "../../../shared/sdk";

const EMPTY = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  tags: "",
  icon: "dashboard",
  highlights: "",
  pointers: "",
  showInContactForm: true,
  isActive: true,
  order: 0
};

/**
 * Must match the icon registry in the website's feature-carousel. An
 * unrecognised key there falls back to a default rather than breaking the
 * carousel, but offering a free-text field would guarantee silent mismatches.
 */
const ICON_OPTIONS = [
  { value: "smartphone", label: "Smartphone (apps)" },
  { value: "globe", label: "Globe (web)" },
  { value: "dashboard", label: "Dashboard (CRM)" },
  { value: "pencil", label: "Pencil (design)" },
  { value: "seo", label: "SEO" },
  { value: "google", label: "Google (ads)" },
  { value: "consultancy", label: "Person (consultancy)" },
  { value: "settings", label: "Settings (maintenance)" },
  { value: "ai", label: "Brain (AI)" }
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Stored as arrays; edited as one-per-line text, which is far less fiddly. */
const toLines = (arr) => (arr ?? []).join("\n");
const fromLines = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function PortfolioServicesPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPortfolioServices(api, { limit: 100 });
      setItems(data.items ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, order: items.length + 1 });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      tags: (item.tags ?? []).join(", "),
      icon: item.icon || "dashboard",
      highlights: toLines(item.highlights),
      pointers: toLines(item.pointers),
      showInContactForm: item.showInContactForm !== false,
      isActive: item.isActive !== false,
      order: item.order ?? 0
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug || slugify(form.title),
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        icon: form.icon,
        highlights: fromLines(form.highlights),
        pointers: fromLines(form.pointers),
        showInContactForm: form.showInContactForm,
        isActive: form.isActive,
        order: Number(form.order) || 0
      };
      if (editing) {
        // Slug is the identity the website joins on, so it is not editable
        // after creation — changing it would orphan nothing visibly but would
        // silently reset any icon mapping keyed off it.
        delete payload.slug;
        await updatePortfolioService(api, editing._id, payload);
      } else {
        await createPortfolioService(api, payload);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (
      !window.confirm(
        `Delete "${item.title}"?\n\nThis removes it from the services page, the homepage carousel AND the contact form dropdown — leads will no longer be able to select it. Set it to Hidden instead if you only want it off the site temporarily.`
      )
    ) {
      return;
    }
    try {
      await deletePortfolioService(api, item._id);
      load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  const ic =
    "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
          <h1 className="text-2xl font-bold">Services</h1>
        </div>
        <RbacGate action="write">
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            + Add Service
          </button>
        </RbacGate>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        This list drives the services page, the homepage carousel and the contact form dropdown. Editing it here changes
        all three.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Enquiries</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground">
                  No services yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{item.order}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-sm truncate">{item.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {item.showInContactForm !== false ? "In dropdown" : "Hidden"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RbacGate action="edit">
                      <button onClick={() => openEdit(item)} className="text-xs text-blue-400 hover:text-blue-300 mr-3">
                        Edit
                      </button>
                    </RbacGate>
                    <RbacGate action="delete">
                      <button onClick={() => handleDelete(item)} className="text-xs text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    </RbacGate>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">{editing ? `Edit ${editing.title}` : "New Service"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl">
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="svc-title" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
                  <input id="svc-title"
                    className={ic}
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        title: e.target.value,
                        slug: editing ? p.slug : slugify(e.target.value)
                      }))
                    }
                    placeholder="App Development"
                  />
                </div>
                <div>
                  <label htmlFor="svc-slug" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</label>
                  <input id="svc-slug"
                    className={`${ic} font-mono ${editing ? "opacity-60" : ""}`}
                    value={form.slug}
                    disabled={Boolean(editing)}
                    onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                    placeholder="app-development"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {editing ? "Fixed after creation." : "Auto-filled from the title."}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="svc-subtitle" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subtitle</label>
                <input id="svc-subtitle"
                  className={ic}
                  value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Mobile solutions that scale"
                />
              </div>

              <div>
                <label htmlFor="svc-description" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </label>
                <textarea id="svc-description"
                  className={`${ic} resize-none`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="svc-tags-comma-separated" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tags (comma separated)
                  </label>
                  <input id="svc-tags-comma-separated"
                    className={ic}
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="React Native, Swift, Kotlin"
                  />
                </div>
                <div>
                  <label htmlFor="svc-icon" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Icon</label>
                  <select id="svc-icon"
                    className={ic}
                    value={form.icon}
                    onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="svc-highlights-one-per" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Highlights (one per line)
                  </label>
                  <textarea id="svc-highlights-one-per"
                    className={`${ic} resize-none font-mono text-xs`}
                    rows={4}
                    value={form.highlights}
                    onChange={(e) => setForm((p) => ({ ...p, highlights: e.target.value }))}
                    placeholder={"iOS & Android\nCross-platform"}
                  />
                </div>
                <div>
                  <label htmlFor="svc-bullet-points-one" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Bullet points (one per line)
                  </label>
                  <textarea id="svc-bullet-points-one"
                    className={`${ic} resize-none font-mono text-xs`}
                    rows={4}
                    value={form.pointers}
                    onChange={(e) => setForm((p) => ({ ...p, pointers: e.target.value }))}
                    placeholder={"Native & hybrid app development\nApp Store deployment"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label htmlFor="svc-order" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</label>
                  <input id="svc-order"
                    type="number"
                    className={ic}
                    value={form.order}
                    onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="svcActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  <label htmlFor="svcActive" className="text-sm">
                    Show on site
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="svcContact"
                    checked={form.showInContactForm}
                    onChange={(e) => setForm((p) => ({ ...p, showInContactForm: e.target.checked }))}
                  />
                  <label htmlFor="svcContact" className="text-sm">
                    In contact form
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{error}</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90"
                >
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
