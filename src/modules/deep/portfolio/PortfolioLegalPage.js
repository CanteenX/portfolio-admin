import React, { useCallback, useEffect, useState } from "react";
import { RbacGate } from "../../../components/common/RequirePermission";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listLegalDocuments,
  createLegalDocument,
  updateLegalDocument,
  deleteLegalDocument
} from "../../../shared/sdk";

const EMPTY = {
  slug: "",
  title: "",
  lastUpdated: "",
  intro: "",
  sections: [],
  isPublished: false,
  order: 0
};

/**
 * Documents the website renders at a fixed route. Publishing one of these
 * replaces the copy shipped in the site's repo; any other slug appears at
 * /legal/<slug>.
 */
const KNOWN_SLUGS = {
  privacy: "/privacy",
  terms: "/terms"
};

export function PortfolioLegalPage() {
  const { api } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDocuments(await listLegalDocuments(api));
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load legal documents");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  function edit(document) {
    setSelected(document);
    setForm({ ...EMPTY, ...document, sections: document.sections ?? [] });
    setNotice("");
  }

  function startNew() {
    setSelected(null);
    setForm(EMPTY);
    setNotice("");
  }

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setSection(index, key, value) {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [key]: value } : section
      )
    }));
  }

  function addSection() {
    setForm(prev => ({ ...prev, sections: [...prev.sections, { heading: "", body: "" }] }));
  }

  function removeSection(index) {
    setForm(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
  }

  function moveSection(index, delta) {
    setForm(prev => {
      const next = [...prev.sections];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, sections: next };
    });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice("");
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      const saved = selected
        ? await updateLegalDocument(api, selected._id, payload)
        : await createLegalDocument(api, payload);
      setSelected(saved);
      setForm({ ...EMPTY, ...saved, sections: saved.sections ?? [] });
      setNotice(saved.isPublished ? "Saved and live on the website." : "Saved as a draft — not visible on the website.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(document) {
    if (!window.confirm(`Delete "${document.title}"? The website falls back to its built-in copy.`)) return;
    try {
      await deleteLegalDocument(api, document._id);
      if (selected?._id === document._id) startNew();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  const fixedRoute = KNOWN_SLUGS[form.slug];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
        <h1 className="text-2xl font-bold">Legal Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Privacy policy, terms and anything else the business publishes. A document is invisible to the
          website until it is marked published — until then the site renders the copy built into it.
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
      {notice && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">{notice}</div>}

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="space-y-2">
          <button
            type="button"
            onClick={startNew}
            className="w-full px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground"
          >
            + New document
          </button>
          {loading ? (
            <div className="text-sm text-muted-foreground px-1">Loading…</div>
          ) : (
            documents.map(document => (
              <button
                key={document._id}
                type="button"
                onClick={() => edit(document)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selected?._id === document._id
                    ? "border-primary bg-muted/50"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div className="font-medium">{document.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span>/{document.slug}</span>
                  <span className={document.isPublished ? "text-green-400" : "text-amber-400"}>
                    {document.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </button>
            ))
          )}
        </aside>

        <form onSubmit={save} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl} htmlFor="legal-slug">URL slug</label>
              <input
                id="legal-slug"
                className={inp}
                value={form.slug}
                onChange={e => set("slug", e.target.value)}
                placeholder="privacy"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {fixedRoute
                  ? `Replaces the built-in page at ${fixedRoute}.`
                  : form.slug
                    ? `Will publish at /legal/${form.slug}.`
                    : "Lowercase letters, numbers and hyphens."}
              </p>
            </div>
            <div>
              <label className={lbl} htmlFor="legal-title">Title</label>
              <input
                id="legal-title"
                className={inp}
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Privacy Policy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl} htmlFor="legal-updated">Last updated</label>
              <input
                id="legal-updated"
                className={inp}
                value={form.lastUpdated}
                onChange={e => set("lastUpdated", e.target.value)}
                placeholder="2026-09-15"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Shown under the title. Change it when the terms change, not when a typo is fixed.
              </p>
            </div>
            <div>
              <label className={lbl} htmlFor="legal-order">Order</label>
              <input
                id="legal-order"
                type="number"
                className={inp}
                value={form.order}
                onChange={e => set("order", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={lbl} htmlFor="legal-intro">Introduction</label>
            <textarea
              id="legal-intro"
              className={`${inp} resize-none`}
              rows={4}
              value={form.intro}
              onChange={e => set("intro", e.target.value)}
              placeholder="Optional opening paragraphs. Leave a blank line between paragraphs."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lbl}>Sections</label>
              <button type="button" onClick={addSection} className="text-xs text-primary hover:opacity-80">
                + Add section
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Each section becomes a heading and its paragraphs on the page. Separate paragraphs with a blank
              line. Formatting marks and HTML are printed as written, not interpreted.
            </p>
            <div className="space-y-3">
              {form.sections.map((section, index) => (
                <div key={index} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className={inp}
                      value={section.heading}
                      onChange={e => setSection(index, "heading", e.target.value)}
                      placeholder="Heading"
                    />
                    <button type="button" onClick={() => moveSection(index, -1)} className="text-muted-foreground hover:text-foreground px-1" title="Move up">↑</button>
                    <button type="button" onClick={() => moveSection(index, 1)} className="text-muted-foreground hover:text-foreground px-1" title="Move down">↓</button>
                    <button type="button" onClick={() => removeSection(index)} className="text-red-400 hover:text-red-300 px-1" title="Remove">×</button>
                  </div>
                  <textarea
                    className={`${inp} resize-none`}
                    rows={5}
                    value={section.body}
                    onChange={e => setSection(index, "body", e.target.value)}
                    placeholder="Section text"
                  />
                </div>
              ))}
              {form.sections.length === 0 && (
                <div className="text-sm text-muted-foreground">No sections yet.</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded"
                checked={form.isPublished}
                onChange={e => set("isPublished", e.target.checked)}
              />
              <span className={form.isPublished ? "text-green-400" : "text-muted-foreground"}>
                Published — replaces the built-in page
              </span>
            </label>
            <div className="flex items-center gap-3">
              {selected && (
                <RbacGate action="delete">
                  <button type="button" onClick={() => remove(selected)} className="text-sm text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </RbacGate>
              )}
              <RbacGate action={selected ? "edit" : "write"}>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {saving ? "Saving…" : selected ? "Save changes" : "Create document"}
                </button>
              </RbacGate>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";
const lbl = "text-xs font-medium text-muted-foreground uppercase tracking-wider";
