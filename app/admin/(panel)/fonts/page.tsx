"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CATEGORY_LABELS, SUBSET_LABELS, SUGGESTED_TAGS } from "@/types";
import type { FontRecord, FontCategory } from "@/types";

/* ── Types ────────────────────────────────────────────────────────────── */
interface AdminFont extends FontRecord {
  createdAt: string;
}

const ALL_SUBSETS = Object.keys(SUBSET_LABELS);
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as FontCategory[];

type FontSource = "GOOGLE" | "LOCAL";

/* ── Form defaults ────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  source: "GOOGLE" as FontSource,
  name: "",
  googleName: "",
  category: "SANS_SERIF" as FontCategory,
  subsets: ["latin"] as string[],
};

/* ── Small components ─────────────────────────────────────────────────── */
function Toggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={() => onChange(!active)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent
                  transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1
                  ${active ? "bg-accent" : "bg-slate-200 dark:bg-slate-700"}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
                    transition-transform ${active ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

/* ── Inline tag editor ────────────────────────────────────────────────── */
function TagEditor({ fontId, initialTags, onSave }: {
  fontId: string;
  initialTags: string[];
  onSave: (tags: string[]) => void;
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function save(nextTags: string[]) {
    setSaving(true);
    await fetch(`/api/admin/fonts/${fontId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: nextTags }),
    });
    setSaving(false);
    onSave(nextTags);
  }

  function addTag(tag: string) {
    const t = tag.toLowerCase().trim().replace(/\s+/g, "-");
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    save(next);
    setInput("");
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    save(next);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  }

  const suggestions = SUGGESTED_TAGS.filter(
    (s) => !tags.includes(s) && s.includes(input.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Current tags */}
      <div className="flex flex-wrap gap-1 min-h-[24px]">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                       bg-accent/10 text-accent border border-accent/20"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="hover:text-red-500 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
        {saving && (
          <svg className="animate-spin text-ink-muted self-center" width="10" height="10"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add tag…"
          className="w-full h-7 px-2 text-xs rounded border border-border bg-surface text-ink
                     focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40
                     placeholder:text-ink-muted"
        />

        {/* Suggestions dropdown */}
        {input && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 z-20 bg-surface border border-border
                          rounded-md shadow-md py-1 min-w-[140px]">
            {suggestions.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="w-full text-left px-3 py-1 text-xs text-ink hover:bg-surface-subtle
                           transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick-add suggested tags not yet applied */}
      {tags.length === 0 && !input && (
        <div className="flex flex-wrap gap-1">
          {SUGGESTED_TAGS.slice(0, 5).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2 py-0.5 rounded-full text-xs border border-dashed border-border
                         text-ink-muted hover:border-accent/40 hover:text-accent transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CAT_COLORS: Record<FontCategory, string> = {
  SERIF:       "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  SANS_SERIF:  "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300",
  MONOSPACE:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  DISPLAY:     "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  HANDWRITING: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

/* ── Main page ────────────────────────────────────────────────────────── */
export default function AdminFontsPage() {
  const [fonts, setFonts] = useState<AdminFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<FontCategory | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFonts = useCallback(async () => {
    const res = await fetch("/api/admin/fonts");
    const data = await res.json();
    setFonts(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFonts(); }, [fetchFonts]);

  /* ── Toggle active ── */
  async function handleToggle(font: AdminFont) {
    setTogglingId(font.id);
    await fetch(`/api/admin/fonts/${font.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !font.isActive }),
    });
    setFonts((prev) =>
      prev.map((f) => f.id === font.id ? { ...f, isActive: !f.isActive } : f)
    );
    setTogglingId(null);
  }

  /* ── Delete ── */
  async function handleDelete(font: AdminFont) {
    if (!confirm(`Delete "${font.name}" permanently? This cannot be undone.`)) return;
    setDeletingId(font.id);
    await fetch(`/api/admin/fonts/${font.id}`, { method: "DELETE" });
    setFonts((prev) => prev.filter((f) => f.id !== font.id));
    setDeletingId(null);
  }

  /* ── Add font ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) { setFormError("Display name is required."); return; }
    if (form.source === "LOCAL" && !uploadFile) {
      setFormError("Please select a font file (.woff2, .woff, .ttf, .otf)."); return;
    }

    setSubmitting(true);

    let filePath: string | undefined;

    // Step 1: upload file if LOCAL
    if (form.source === "LOCAL" && uploadFile) {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", uploadFile);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      setUploading(false);

      if (!uploadRes.ok) {
        setFormError(uploadData.error ?? "Upload failed.");
        setSubmitting(false);
        return;
      }
      filePath = uploadData.filePath;
    }

    // Step 2: create font record
    const res = await fetch("/api/admin/fonts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: form.source,
        name: form.name.trim(),
        googleName: form.source === "GOOGLE"
          ? (form.googleName.trim() || form.name.trim())
          : undefined,
        filePath,
        category: form.category,
        subsets: form.subsets,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(data.error ?? "Something went wrong.");
      return;
    }

    setFonts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(EMPTY_FORM);
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowForm(false);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setUploadFile(null);
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowForm(false);
  }

  /* ── Filtered list ── */
  const visible = fonts.filter((f) => {
    if (filterCat !== "ALL" && f.category !== filterCat) return false;
    if (filterStatus === "active" && !f.isActive) return false;
    if (filterStatus === "inactive" && f.isActive) return false;
    return true;
  });

  const activeCount = fonts.filter((f) => f.isActive).length;
  const inactiveCount = fonts.length - activeCount;

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Fonts</h1>
          <p className="text-sm text-ink-muted mt-0.5 font-sans">
            {fonts.length} total · {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-sm
                     font-medium hover:opacity-90 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add font
        </button>
      </div>

      {/* ── Add font form ── */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface-subtle p-6">

          {/* Source toggle */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-lg bg-surface border border-border w-fit">
            {(["GOOGLE", "LOCAL"] as FontSource[]).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, source: src }));
                  setFormError("");
                  setUploadFile(null);
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  form.source === src
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {src === "GOOGLE" ? "Google Fonts" : "Upload file"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Display name */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="f-name">
                Display name <span className="text-red-500">*</span>
              </label>
              <input
                id="f-name"
                type="text"
                required
                placeholder={form.source === "GOOGLE" ? "e.g. Playfair Display" : "e.g. My Custom Font"}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              />
            </div>

            {/* Google name OR file upload */}
            {form.source === "GOOGLE" ? (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="f-google">
                  Google Fonts name
                  <span className="ml-1.5 text-xs text-ink-muted font-normal">(if different from display name)</span>
                </label>
                <input
                  id="f-google"
                  type="text"
                  placeholder="Exact name from fonts.google.com"
                  value={form.googleName}
                  onChange={(e) => setForm((f) => ({ ...f, googleName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm
                             focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                />
                <p className="mt-1 text-xs text-ink-muted font-sans">
                  Must match exactly as it appears on{" "}
                  <a href="https://fonts.google.com" target="_blank" rel="noreferrer"
                    className="underline hover:text-ink">fonts.google.com</a>
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Font file <span className="text-red-500">*</span>
                  <span className="ml-1.5 text-xs text-ink-muted font-normal">.woff2 · .woff · .ttf · .otf</span>
                </label>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md border bg-surface text-sm
                               cursor-pointer hover:border-accent/40 transition-colors ${
                                 uploadFile ? "border-accent/60" : "border-dashed border-border"
                               }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" className="text-ink-muted shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className={uploadFile ? "text-ink" : "text-ink-muted"}>
                    {uploadFile ? uploadFile.name : "Choose font file…"}
                  </span>
                  {uploadFile && (
                    <span className="ml-auto text-xs text-ink-muted font-sans">
                      {(uploadFile.size / 1024).toFixed(0)} KB
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".woff2,.woff,.ttf,.otf"
                    className="sr-only"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="f-cat">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="f-cat"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FontCategory }))}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {/* Subsets */}
            <div>
              <p className="text-sm font-medium text-ink mb-2">Subsets</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {ALL_SUBSETS.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 text-sm text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.subsets.includes(s)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          subsets: e.target.checked
                            ? [...f.subsets, s]
                            : f.subsets.filter((x) => x !== s),
                        }))
                      }
                      className="rounded border-border accent-accent"
                    />
                    {SUBSET_LABELS[s]}
                  </label>
                ))}
              </div>
            </div>

            {/* Error + buttons */}
            <div className="sm:col-span-2 flex items-center gap-3 flex-wrap pt-1">
              {formError && <p className="text-sm text-red-500 flex-1">{formError}</p>}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md border border-border text-sm text-ink-muted
                             hover:text-ink hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium
                             hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[90px]"
                >
                  {uploading ? "Uploading…" : submitting ? "Adding…" : "Add font"}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 flex-wrap">
          {(["ALL", ...ALL_CATEGORIES] as (FontCategory | "ALL")[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCat(c)}
              className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${
                filterCat === c
                  ? "bg-accent text-white"
                  : "border border-border text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              {c === "ALL" ? "All categories" : CATEGORY_LABELS[c as FontCategory]}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border hidden sm:block" />

        <div className="flex items-center gap-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-ink text-surface"
                  : "border border-border text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-ink-muted font-sans">
          {visible.length} font{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Fonts table ── */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-sm text-ink-muted">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading…
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-subtle border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Font</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide hidden md:table-cell">Subsets</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide hidden lg:table-cell">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide hidden xl:table-cell">Source</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">
                    No fonts match your filters.
                  </td>
                </tr>
              ) : (
                visible.map((font) => (
                  <tr
                    key={font.id}
                    className={`group bg-surface transition-colors hover:bg-surface-subtle ${
                      !font.isActive ? "opacity-50" : ""
                    }`}
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/?font=${font.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-ink hover:text-accent transition-colors"
                          title="Preview on public site"
                        >
                          {font.name}
                        </a>
                        <span className="text-xs text-ink-muted font-sans hidden sm:block">/{font.slug}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${CAT_COLORS[font.category]}`}>
                        {CATEGORY_LABELS[font.category]}
                      </span>
                    </td>

                    {/* Subsets */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {font.subsets.map((s) => (
                          <span key={s} className={`subset-badge subset-${s}`}>{s}</span>
                        ))}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ minWidth: 200 }}>
                      <TagEditor
                        fontId={font.id}
                        initialTags={font.tags}
                        onSave={(tags) =>
                          setFonts((prev) =>
                            prev.map((f) => f.id === font.id ? { ...f, tags } : f)
                          )
                        }
                      />
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {font.source === "GOOGLE" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-muted font-sans">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted font-sans">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          Local
                          {font.filePath && (
                            <a
                              href={font.filePath}
                              download
                              title="Download font file"
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 hover:text-accent transition-colors"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                            </a>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {togglingId === font.id ? (
                          <svg className="animate-spin text-ink-muted" width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <Toggle active={font.isActive} onChange={() => handleToggle(font)} />
                        )}
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(font)}
                        disabled={deletingId === font.id}
                        title="Delete font"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded
                                   text-ink-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                                   disabled:opacity-30"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
