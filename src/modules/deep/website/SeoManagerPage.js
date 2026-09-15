import { RbacGate } from "../../../components/common/RequirePermission";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  createSeoMeta,
  deleteSeoMeta,
  listSeoMeta,
  updateSeoMeta
} from "../../../shared/sdk/seo";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  absoluteUrlFor,
  canonicalProblem,
  completeness,
  counterState,
  keywordList,
  normaliseSlug
} from "./seo/seoRules";
import { GooglePreview, SeoScorePanel } from "./seo/SeoScorePanel";

const CATEGORIES = ["Marketing", "Detail", "Other"];

const EMPTY = {
  slug: "",
  pageTitle: "",
  category: "Marketing",
  icon: "",
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
  noIndex: false,
  isActive: true
};

const INPUT =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

/** Label + control with the association made, so the field is actually named. */
function Field({ id, label, counter, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {counter ? (
          <span className={`text-xs tabular-nums ${counter.tone}`}>
            {counter.count}/{counter.limit} · {counter.label}
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function SeoManagerPage() {
  const { api } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listSeoMeta(api));
      setError("");
    } catch {
      setError("Could not load SEO rows.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "All" ? rows : rows.filter((r) => r.category === filter)),
    [rows, filter]
  );

  const openCreate = () => {
    setEditing("new");
    setValues(EMPTY);
    setSaveError("");
  };

  const openEdit = (row) => {
    setEditing(row._id);
    setValues({ ...EMPTY, ...row, keywords: keywordList(row.keywords) });
    setSaveError("");
  };

  const set = (key) => (e) =>
    setValues((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    // Normalise before sending so what the editor scores is what the server
    // stores — the API applies the same rule, and a mismatch here would score
    // one slug and save another.
    const payload = { ...values, slug: normaliseSlug(values.slug) };

    const canonicalIssue = canonicalProblem(payload.canonicalUrl);
    if (canonicalIssue) {
      setSaveError(canonicalIssue);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      if (editing === "new") await createSeoMeta(api, payload);
      else await updateSeoMeta(api, editing, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setSaveError(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this SEO row? The page falls back to its built-in title.")) return;
    try {
      await deleteSeoMeta(api, id);
      if (editing === id) setEditing(null);
      await load();
    } catch {
      setError("Delete failed.");
    }
  };

  const previewUrl = values.canonicalUrl || absoluteUrlFor(values.slug);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SEO Manager</h1>
          <p className="text-sm text-muted-foreground">
            One row per route. A page with no row falls back to the title shipped in its code.
          </p>
        </div>
        <RbacGate action="write">
          <button
            onClick={openCreate}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            New page
          </button>
        </RbacGate>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-xl border border-border">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No rows yet. Every page still works — it just uses its built-in title.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((row) => {
                const status = completeness(row);
                return (
                  <li key={row._id} className="flex items-center gap-3 p-4">
                    <button onClick={() => openEdit(row)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-medium">{row.pageTitle}</div>
                      <div className="truncate font-mono text-xs text-muted-foreground">{row.slug}</div>
                    </button>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.tone}`}>
                      {status.label}
                    </span>
                    <RbacGate action="delete">
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="shrink-0 text-xs text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </RbacGate>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-border p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="seoSlug" label="Route" hint="The exact path, e.g. /services">
                <input id="seoSlug" value={values.slug} onChange={set("slug")} required className={INPUT} placeholder="/services" />
              </Field>
              <Field id="seoPageTitle" label="Label (admin only)">
                <input id="seoPageTitle" value={values.pageTitle} onChange={set("pageTitle")} required className={INPUT} placeholder="Services" />
              </Field>
            </div>

            <Field id="seoMetaTitle" label="Meta title" counter={counterState(values.metaTitle, TITLE_LIMIT)}>
              <input id="seoMetaTitle" value={values.metaTitle} onChange={set("metaTitle")} className={INPUT} />
            </Field>

            <Field
              id="seoMetaDescription"
              label="Meta description"
              counter={counterState(values.metaDescription, DESCRIPTION_LIMIT)}
            >
              <textarea id="seoMetaDescription" rows={3} value={values.metaDescription} onChange={set("metaDescription")} className={`${INPUT} resize-none`} />
            </Field>

            <Field id="seoKeywordInput" label="Keywords" hint="Comma separated.">
              <input
                id="seoKeywordInput"
                value={Array.isArray(values.keywords) ? values.keywords.join(", ") : values.keywords}
                onChange={(e) => setValues((p) => ({ ...p, keywords: keywordList(e.target.value) }))}
                className={INPUT}
              />
            </Field>

            <Field
              id="seoCanonicalUrl"
              label="Canonical URL"
              hint={canonicalProblem(values.canonicalUrl) || "Blank means this page is its own canonical."}
            >
              <input id="seoCanonicalUrl" value={values.canonicalUrl} onChange={set("canonicalUrl")} className={INPUT} placeholder={absoluteUrlFor(values.slug)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="seoOgTitle" label="Social title">
                <input id="seoOgTitle" value={values.ogTitle} onChange={set("ogTitle")} className={INPUT} />
              </Field>
              <Field id="seoOgImage" label="Social image URL">
                <input id="seoOgImage" value={values.ogImage} onChange={set("ogImage")} className={INPUT} />
              </Field>
            </div>

            <Field id="seoOgDescription" label="Social description">
              <textarea id="seoOgDescription" rows={2} value={values.ogDescription} onChange={set("ogDescription")} className={`${INPUT} resize-none`} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="seoCategory" label="Category">
                <select id="seoCategory" value={values.category} onChange={set("category")} className={INPUT}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end gap-2 pb-2">
                <input id="seoNoIndex" type="checkbox" checked={values.noIndex} onChange={set("noIndex")} className="size-4 accent-primary" />
                <label htmlFor="seoNoIndex" className="text-sm">Hide from search engines</label>
              </div>
            </div>

            {saveError ? <p role="alert" className="text-sm text-red-500">{saveError}</p> : null}

            <div className="flex gap-2">
              <RbacGate action={editing === "new" ? "write" : "edit"}>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
              </RbacGate>
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-5 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-border p-6 text-sm text-muted-foreground">
            Select a page, or create one.
          </div>
        )}
      </div>

      {editing ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <GooglePreview values={values} url={previewUrl} />
          <SeoScorePanel values={values} />
        </div>
      ) : null}
    </div>
  );
}
