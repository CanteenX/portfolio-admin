import React, { useCallback, useEffect, useState } from "react";
import { RbacGate } from "../../../components/common/RequirePermission";
import { useAuth } from "../../../core/auth/AuthContext";
import { listFaqs, createFaq, updateFaq, deleteFaq } from "../../../shared/sdk";

const EMPTY = { question: "", answer: "", category: "", isActive: true, order: 0 };

export function PortfolioFaqPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listFaqs(api));
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function startNew() {
    setEditing(null);
    // Puts a new question at the end of the list instead of tying at 0, where
    // ordering would fall back to insertion order and look arbitrary.
    setForm({ ...EMPTY, order: items.length });
  }

  function edit(item) {
    setEditing(item);
    setForm({ ...EMPTY, ...item });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) await updateFaq(api, editing._id, payload);
      else await createFaq(api, payload);
      startNew();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.question}"?`)) return;
    try {
      await deleteFaq(api, item._id);
      if (editing?._id === item._id) startNew();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  async function toggleActive(item) {
    try {
      await updateFaq(api, item._id, { isActive: !item.isActive });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Update failed");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
        <h1 className="text-2xl font-bold">FAQ</h1>
        <p className="text-sm text-gray-500 mt-1">
          Published questions appear on the website's FAQ page and are marked up for search engines, which
          only show them as rich results while the answer is visible on the page. Keep answers factual.
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={save} className="rounded-xl border border-border p-6 space-y-4 mb-8">
        <h3 className="font-semibold text-base border-b border-border pb-3">
          {editing ? "Edit question" : "Add question"}
        </h3>
        <div>
          <label className={lbl} htmlFor="faq-question">Question</label>
          <input
            id="faq-question"
            className={inp}
            value={form.question}
            onChange={e => set("question", e.target.value)}
            placeholder="How long does a typical build take?"
          />
        </div>
        <div>
          <label className={lbl} htmlFor="faq-answer">Answer</label>
          <textarea
            id="faq-answer"
            className={`${inp} resize-none`}
            rows={5}
            value={form.answer}
            onChange={e => set("answer", e.target.value)}
            placeholder="Plain text. Line breaks are preserved on the page."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={lbl} htmlFor="faq-category">Category</label>
            <input
              id="faq-category"
              className={inp}
              value={form.category}
              onChange={e => set("category", e.target.value)}
              placeholder="Engagement (optional)"
            />
          </div>
          <div>
            <label className={lbl} htmlFor="faq-order">Order</label>
            <input
              id="faq-order"
              type="number"
              className={inp}
              value={form.order}
              onChange={e => set("order", e.target.value)}
            />
          </div>
          <label className="flex items-end gap-2 text-sm pb-2">
            <input
              type="checkbox"
              className="rounded"
              checked={form.isActive}
              onChange={e => set("isActive", e.target.checked)}
            />
            <span className="text-muted-foreground">Published</span>
          </label>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <RbacGate action={editing ? "edit" : "write"}>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add question"}
            </button>
          </RbacGate>
          {editing && (
            <button type="button" onClick={startNew} className="text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No questions yet. The website says so plainly rather than inventing any.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item._id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">{item.question}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.answer}</div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                    <span>#{item.order}</span>
                    {item.category && <span>{item.category}</span>}
                    <span className={item.isActive ? "text-green-400" : "text-amber-400"}>
                      {item.isActive ? "Published" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <RbacGate action="edit">
                    <button type="button" onClick={() => toggleActive(item)} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.isActive ? "Hide" : "Publish"}
                    </button>
                  </RbacGate>
                  <RbacGate action="edit">
                    <button type="button" onClick={() => edit(item)} className="text-sm text-blue-400 hover:text-blue-300">
                      Edit
                    </button>
                  </RbacGate>
                  <RbacGate action="delete">
                    <button type="button" onClick={() => remove(item)} className="text-sm text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </RbacGate>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inp = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";
const lbl = "text-xs font-medium text-muted-foreground uppercase tracking-wider";
