import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { testimonialsApi, clientLogosApi, metricsApi, uploadPortfolioImage } from "../../../shared/sdk";

const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:7002";

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

/**
 * Each tab is described by data rather than by its own component, because the
 * three resources differ only in their fields. `fields` drives both the table
 * and the form, so a column can't end up showing something the form can't edit.
 */
const TABS = [
  {
    key: "testimonials",
    label: "Testimonials",
    api: testimonialsApi,
    empty: { quote: "", authorName: "", authorRole: "", authorCompany: "", avatar: "", rating: "", isActive: true, order: 0 },
    columns: [
      { key: "authorName", label: "Author" },
      { key: "authorCompany", label: "Company" },
      { key: "quote", label: "Quote", truncate: true }
    ],
    fields: [
      { key: "quote", label: "Quote", type: "textarea", rows: 4, required: true },
      { key: "authorName", label: "Author name", type: "text", required: true },
      { key: "authorRole", label: "Author role", type: "text" },
      { key: "authorCompany", label: "Company", type: "text" },
      { key: "avatar", label: "Avatar", type: "image" },
      { key: "rating", label: "Rating (1-5, blank for none)", type: "number" }
    ],
    // A quote with no attributable person is not social proof, it is a slogan.
    hint: "Only publish quotes you have written permission to attribute. Leave the rating blank rather than guessing."
  },
  {
    key: "client-logos",
    label: "Client Logos",
    api: clientLogosApi,
    empty: { name: "", logo: "", websiteUrl: "", isActive: true, order: 0 },
    columns: [
      { key: "logo", label: "Logo", type: "image" },
      { key: "name", label: "Name" },
      { key: "websiteUrl", label: "Website", truncate: true }
    ],
    fields: [
      { key: "name", label: "Client name", type: "text", required: true },
      { key: "logo", label: "Logo image", type: "image" },
      { key: "websiteUrl", label: "Website URL", type: "text" }
    ],
    hint: "The name is always shown; the logo image is optional. Only add a website link if the client agreed to be linked."
  },
  {
    key: "metrics",
    label: "Metrics",
    api: metricsApi,
    empty: { value: "", label: "", description: "", isActive: true, order: 0 },
    columns: [
      { key: "value", label: "Value" },
      { key: "label", label: "Label" },
      { key: "description", label: "Description", truncate: true }
    ],
    fields: [
      { key: "value", label: "Value", type: "text", required: true, placeholder: "8,000+" },
      { key: "label", label: "Label", type: "text", required: true, placeholder: "Daily active users" },
      { key: "description", label: "Description", type: "textarea", rows: 2 }
    ],
    hint: "Values are free text, so \"99.9%\" and \"40+\" are both fine. Every figure should be one you can substantiate."
  }
];

export function PortfolioSocialProofPage() {
  const { api } = useAuth();
  const [tabKey, setTabKey] = useState(TABS[0].key);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const fileRef = useRef(null);
  const pendingImageField = useRef(null);

  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await tab.api.list(api));
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [api, tab]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...tab.empty, order: items.length + 1 });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    const next = { ...tab.empty };
    Object.keys(next).forEach((key) => {
      next[key] = item[key] ?? next[key];
    });
    // Sent as undefined rather than 0 when blank, so "no rating" stays absent
    // instead of rendering as zero stars on the site.
    next.rating = item.rating ?? "";
    setForm(next);
    setShowModal(true);
  }

  function pickImage(fieldKey) {
    pendingImageField.current = fieldKey;
    fileRef.current?.click();
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    const fieldKey = pendingImageField.current;
    e.target.value = "";
    if (!file || !fieldKey) return;
    setUploadingKey(fieldKey);
    try {
      const url = await uploadPortfolioImage(api, file);
      setForm((prev) => ({ ...prev, [fieldKey]: url }));
    } catch {
      setError("Image upload failed");
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if ("rating" in payload) {
        const rating = Number(payload.rating);
        if (payload.rating === "" || Number.isNaN(rating)) delete payload.rating;
        else payload.rating = rating;
      }
      if (editing) await tab.api.update(api, editing._id, payload);
      else await tab.api.create(api, payload);
      setShowModal(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await tab.api.remove(api, item._id);
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
          <h1 className="text-2xl font-bold">Social Proof</h1>
        </div>
        <RbacGate action="write">
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            + Add {tab.label.replace(/s$/, "")}
          </button>
        </RbacGate>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Each section is hidden on the website until it has at least one active entry — nothing is invented to fill the
        space.
      </p>

      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTabKey(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              t.key === tabKey
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab.hint && (
        <div className="mb-4 p-3 bg-muted/30 border border-border rounded-lg text-sm text-muted-foreground">
          {tab.hint}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
              {tab.columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {col.label}
                </th>
              ))}
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={tab.columns.length + 3} className="text-center py-10 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={tab.columns.length + 3} className="text-center py-10 text-muted-foreground">
                  No {tab.label.toLowerCase()} yet — this section is hidden on the site.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{item.order}</td>
                  {tab.columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.truncate ? "text-muted-foreground text-xs max-w-xs truncate" : ""}`}
                    >
                      {col.type === "image" ? (
                        item[col.key] ? (
                          <img
                            src={imgSrc(item[col.key])}
                            alt=""
                            className="w-10 h-10 rounded object-contain bg-muted"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )
                      ) : (
                        item[col.key]
                      )}
                    </td>
                  ))}
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

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit" : "New"} {tab.label.replace(/s$/, "")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {tab.fields.map((field) => (
                <div key={field.key}>
                  <label htmlFor="sp-field-label-field" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea id="sp-field-label-field"
                      className={`${ic} resize-none`}
                      rows={field.rows ?? 3}
                      required={field.required}
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    />
                  ) : field.type === "image" ? (
                    <div className="mt-1 flex items-center gap-3">
                      {form[field.key] && (
                        <img
                          src={imgSrc(form[field.key])}
                          alt="preview"
                          className="w-12 h-12 rounded object-contain bg-muted border border-border"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => pickImage(field.key)}
                        disabled={uploadingKey === field.key}
                        className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
                      >
                        {uploadingKey === field.key ? "Uploading..." : "Choose Image"}
                      </button>
                      {form[field.key] && (
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, [field.key]: "" }))}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      className={ic}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sp-order" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</label>
                  <input id="sp-order"
                    type="number"
                    className={ic}
                    value={form.order ?? 0}
                    onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="spActive"
                    checked={Boolean(form.isActive)}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  <label htmlFor="spActive" className="text-sm">
                    Show on site
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
