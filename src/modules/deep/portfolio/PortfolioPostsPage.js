import React, { useCallback, useEffect, useState } from "react";
import { RbacGate } from "../../../components/common/RequirePermission";
import { useAuth } from "../../../core/auth/AuthContext";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadPortfolioImage
} from "../../../shared/sdk";

const EMPTY = {
  slug: "",
  title: "",
  excerpt: "",
  coverImage: "",
  category: "",
  tags: [],
  authorName: "",
  authorRole: "",
  publishedAt: "",
  readingMinutes: 0,
  blocks: [],
  isPublished: false,
  isFeatured: false,
  order: 0
};

const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph", labelHint: "" },
  { value: "heading", label: "Heading", labelHint: "Heading text" },
  { value: "quote", label: "Quote", labelHint: "Attribution" },
  { value: "code", label: "Code", labelHint: "Language" },
  { value: "list", label: "Bulleted list", labelHint: "" }
];

/** Mirrors the server's slug rule so a bad slug is caught before the request. */
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** ~200 words a minute, rounded up. A rough number is more useful than none. */
function estimateReadingMinutes(blocks) {
  const words = blocks
    .map(block => `${block.label} ${block.text}`)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function PortfolioPostsPage() {
  const { api } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await listPosts(api));
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load posts");
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
    setEditingId(null);
    setForm(EMPTY);
    setNotice("");
  }

  async function edit(summary) {
    setNotice("");
    try {
      // The list response omits blocks, so the body is fetched on demand
      // rather than being wiped by a save that posted an empty array.
      const full = await getPost(api, summary._id);
      setEditingId(full._id);
      setForm({ ...EMPTY, ...full, tags: full.tags ?? [], blocks: full.blocks ?? [] });
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to open post");
    }
  }

  function addBlock(type) {
    setForm(prev => ({ ...prev, blocks: [...prev.blocks, { type, label: "", text: "" }] }));
  }

  function setBlock(index, key, value) {
    setForm(prev => ({
      ...prev,
      blocks: prev.blocks.map((block, i) => (i === index ? { ...block, [key]: value } : block))
    }));
  }

  function removeBlock(index) {
    setForm(prev => ({ ...prev, blocks: prev.blocks.filter((_, i) => i !== index) }));
  }

  function moveBlock(index, delta) {
    setForm(prev => {
      const next = [...prev.blocks];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, blocks: next };
    });
  }

  async function handleCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      set("coverImage", await uploadPortfolioImage(api, file));
    } catch (err) {
      setError(err?.response?.data?.message ?? "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice("");
    try {
      const payload = {
        ...form,
        slug: slugify(form.slug || form.title),
        tags: form.tags.map(t => t.trim()).filter(Boolean),
        order: Number(form.order) || 0,
        readingMinutes: Number(form.readingMinutes) || estimateReadingMinutes(form.blocks)
      };
      const saved = editingId
        ? await updatePost(api, editingId, payload)
        : await createPost(api, payload);
      setEditingId(saved._id);
      setForm({ ...EMPTY, ...saved, tags: saved.tags ?? [], blocks: saved.blocks ?? [] });
      setNotice(
        saved.isPublished
          ? `Published at /insights/${saved.slug}.`
          : "Saved as a draft — not visible on the website."
      );
      await load();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(summary) {
    if (!window.confirm(`Delete "${summary.title}"? This cannot be undone.`)) return;
    try {
      await deletePost(api, summary._id);
      if (editingId === summary._id) startNew();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Delete failed");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-sm text-gray-500 mt-1">
          Posts published here appear at /insights, in the RSS feed and in the sitemap. Body text is
          plain — formatting marks and HTML are printed exactly as typed, never interpreted.
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
      {notice && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          <button
            type="button"
            onClick={startNew}
            className="w-full px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground"
          >
            + New post
          </button>
          {loading ? (
            <div className="text-sm text-muted-foreground px-1">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="text-sm text-muted-foreground px-1">No posts yet.</div>
          ) : (
            posts.map(post => (
              <div
                key={post._id}
                className={`rounded-lg border p-3 transition-colors ${
                  editingId === post._id ? "border-primary bg-muted/50" : "border-border"
                }`}
              >
                <button type="button" onClick={() => edit(post)} className="text-left w-full">
                  <div className="font-medium text-sm">{post.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span className={post.isPublished ? "text-green-400" : "text-amber-400"}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                    {post.publishedAt && <span>{post.publishedAt}</span>}
                  </div>
                </button>
                <RbacGate action="delete">
                  <button
                    type="button"
                    onClick={() => remove(post)}
                    className="text-xs text-red-400 hover:text-red-300 mt-2"
                  >
                    Delete
                  </button>
                </RbacGate>
              </div>
            ))
          )}
        </aside>

        <form onSubmit={save} className="space-y-6">
          <div className="rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-base border-b border-border pb-3">Post details</h3>
            <div>
              <label className={lbl} htmlFor="post-title">Title</label>
              <input id="post-title" className={inp} value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl} htmlFor="post-slug">Slug</label>
                <input
                  id="post-slug"
                  className={inp}
                  value={form.slug}
                  onChange={e => set("slug", e.target.value)}
                  onBlur={e => set("slug", slugify(e.target.value || form.title))}
                  placeholder="what-we-learned-shipping-x"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Part of the URL. Changing it on a published post breaks existing links.
                </p>
              </div>
              <div>
                <label className={lbl} htmlFor="post-category">Category</label>
                <input id="post-category" className={inp} value={form.category} onChange={e => set("category", e.target.value)} placeholder="Engineering" />
              </div>
            </div>
            <div>
              <label className={lbl} htmlFor="post-excerpt">Excerpt</label>
              <textarea
                id="post-excerpt"
                className={`${inp} resize-none`}
                rows={3}
                value={form.excerpt}
                onChange={e => set("excerpt", e.target.value)}
                placeholder="One or two sentences. Used on the index, in search results and in the feed."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl} htmlFor="post-author">Author name</label>
                <input id="post-author" className={inp} value={form.authorName} onChange={e => set("authorName", e.target.value)} />
              </div>
              <div>
                <label className={lbl} htmlFor="post-author-role">Author role</label>
                <input id="post-author-role" className={inp} value={form.authorRole} onChange={e => set("authorRole", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl} htmlFor="post-date">Published date</label>
                <input id="post-date" type="date" className={inp} value={form.publishedAt?.slice(0, 10) ?? ""} onChange={e => set("publishedAt", e.target.value)} />
              </div>
              <div>
                <label className={lbl} htmlFor="post-reading">Reading minutes</label>
                <input
                  id="post-reading"
                  type="number"
                  className={inp}
                  value={form.readingMinutes}
                  onChange={e => set("readingMinutes", e.target.value)}
                  placeholder="0 = estimate on save"
                />
              </div>
              <div>
                <label className={lbl} htmlFor="post-order">Order</label>
                <input id="post-order" type="number" className={inp} value={form.order} onChange={e => set("order", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl} htmlFor="post-tags">Tags (comma separated)</label>
              <input
                id="post-tags"
                className={inp}
                value={form.tags.join(", ")}
                onChange={e => set("tags", e.target.value.split(","))}
                placeholder="react, performance"
              />
            </div>
            <div>
              <label className={lbl} htmlFor="post-cover">Cover image</label>
              <div className="flex items-center gap-3 mt-1">
                <input id="post-cover" type="file" accept="image/*" onChange={handleCover} className="text-sm" />
                {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
              </div>
              {form.coverImage && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground break-all">{form.coverImage}</span>
                  <button type="button" onClick={() => set("coverImage", "")} className="text-xs text-red-400 hover:text-red-300">
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-base">Body</h3>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => addBlock(type.value)}
                    className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground"
                  >
                    + {type.label}
                  </button>
                ))}
              </div>
            </div>

            {form.blocks.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No blocks yet. Add a paragraph to start.
              </div>
            )}

            {form.blocks.map((block, index) => {
              const meta = BLOCK_TYPES.find(t => t.value === block.type) ?? BLOCK_TYPES[0];
              return (
                <div key={index} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      className={`${inp} max-w-[160px]`}
                      value={block.type}
                      onChange={e => setBlock(index, "type", e.target.value)}
                    >
                      {BLOCK_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {meta.labelHint && (
                      <input
                        className={inp}
                        value={block.label}
                        onChange={e => setBlock(index, "label", e.target.value)}
                        placeholder={meta.labelHint}
                      />
                    )}
                    <button type="button" onClick={() => moveBlock(index, -1)} className="text-muted-foreground hover:text-foreground px-1" title="Move up">↑</button>
                    <button type="button" onClick={() => moveBlock(index, 1)} className="text-muted-foreground hover:text-foreground px-1" title="Move down">↓</button>
                    <button type="button" onClick={() => removeBlock(index)} className="text-red-400 hover:text-red-300 px-1" title="Remove">×</button>
                  </div>
                  {block.type !== "heading" && (
                    <textarea
                      className={`${inp} resize-none ${block.type === "code" ? "font-mono" : ""}`}
                      rows={block.type === "paragraph" || block.type === "code" ? 6 : 4}
                      value={block.text}
                      onChange={e => setBlock(index, "text", e.target.value)}
                      placeholder={block.type === "list" ? "One item per line" : "Text"}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" checked={form.isPublished} onChange={e => set("isPublished", e.target.checked)} />
                <span className={form.isPublished ? "text-green-400" : "text-muted-foreground"}>Published</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" checked={form.isFeatured} onChange={e => set("isFeatured", e.target.checked)} />
                <span className="text-muted-foreground">Featured</span>
              </label>
            </div>
            <RbacGate action={editingId ? "edit" : "write"}>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Create post"}
              </button>
            </RbacGate>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";
const lbl = "text-xs font-medium text-muted-foreground uppercase tracking-wider";
