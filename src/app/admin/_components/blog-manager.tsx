"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

export type EditableBlogPost = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  category: string; imageUrl: string; imageAlt: string; isPublished: boolean;
};

const empty: EditableBlogPost = { id: "", title: "", slug: "", excerpt: "", content: "", category: "Buying Guide", imageUrl: "", imageAlt: "", isPublished: false };

export function BlogManager({ initialPosts, disabled = false }: { initialPosts: EditableBlogPost[]; disabled?: boolean }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState(empty);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const field = (key: keyof EditableBlogPost) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({ ...draft, [key]: event.target.value });
  const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  async function save() {
    setSaving(true); setMessage("");
    const url = draft.id ? `/api/admin/blogs/${draft.id}` : "/api/admin/blogs";
    const response = await fetch(url, { method: draft.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const json = await response.json();
    setSaving(false);
    if (!response.ok) return setMessage(json.error || "Post could not be saved.");
    const post = { ...json.post, imageUrl: json.post.imageUrl || "", imageAlt: json.post.imageAlt || "" };
    setPosts((rows) => draft.id ? rows.map((row) => row.id === post.id ? post : row) : [post, ...rows]);
    setDraft(empty); setMessage(post.isPublished ? "Post published successfully." : "Draft saved successfully.");
  }

  async function remove(post: EditableBlogPost) {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/blogs/${post.id}`, { method: "DELETE" });
    if (response.ok) { setPosts((rows) => rows.filter((row) => row.id !== post.id)); if (draft.id === post.id) setDraft(empty); }
    else setMessage("Post could not be deleted.");
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,.75fr)]">
    <section className="rounded-xl border border-line bg-surface p-5 shadow-xs">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{draft.id ? "Edit blog post" : "Create blog post"}</h2>{draft.id && <button className="text-sm font-semibold text-accent" onClick={() => setDraft(empty)}>New post</button>}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-semibold">Title<input className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal" value={draft.title} onChange={(e) => { field("title")(e); if (!draft.id) setDraft((old) => ({ ...old, title: e.target.value, slug: slugify(e.target.value) })); }} /></label>
        <label className="text-sm font-semibold">URL slug<input className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal" value={draft.slug} onChange={field("slug")} /></label>
        <label className="text-sm font-semibold">Category<input className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal" value={draft.category} onChange={field("category")} /></label>
        <label className="sm:col-span-2 text-sm font-semibold">Short SEO description<textarea rows={3} className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal" value={draft.excerpt} onChange={field("excerpt")} /></label>
        <label className="text-sm font-semibold">Cover image URL<input placeholder="/images/blog/example.webp" className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal" value={draft.imageUrl} onChange={field("imageUrl")} /></label>
        <label className="text-sm font-semibold">Image alt text<input className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal" value={draft.imageAlt} onChange={field("imageAlt")} /></label>
        <label className="sm:col-span-2 text-sm font-semibold">Article content<textarea rows={15} placeholder="Write paragraphs separated by a blank line." className="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-normal leading-7" value={draft.content} onChange={field("content")} /></label>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} /> Publish on website</label>
      {message && <p role="status" className="mt-4 text-sm text-secondary">{message}</p>}
      <button disabled={disabled || saving} onClick={save} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-action px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus className="size-4" />{saving ? "Saving…" : draft.id ? "Save changes" : "Create post"}</button>
    </section>
    <section className="rounded-xl border border-line bg-surface p-5 shadow-xs">
      <h2 className="text-lg font-bold">Posts ({posts.length})</h2>
      <div className="mt-4 space-y-3">{posts.map((post) => <article key={post.id} className="rounded-lg border border-line p-4"><div className="flex gap-3"><div className="min-w-0 flex-1"><p className="font-bold">{post.title}</p><p className="mt-1 text-xs text-muted">/{post.slug} · {post.isPublished ? "Published" : "Draft"}</p></div><button aria-label="Edit post" onClick={() => setDraft(post)} className="text-accent"><Pencil className="size-4" /></button><button aria-label="Delete post" onClick={() => remove(post)} className="text-danger"><Trash2 className="size-4" /></button></div></article>)}</div>
    </section>
  </div>;
}
