"use client";

import { useEffect, useState, useCallback } from "react";
import { CATEGORY_LABELS, SUBSET_LABELS } from "@/types";
import type { FontRecord, FontCategory } from "@/types";

/* ── Types ────────────────────────────────────────────────────────────── */
interface AdminFont extends FontRecord {
  createdAt: string;
}

const ALL_SUBSETS = Object.keys(SUBSET_LABELS);
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as FontCategory[];

/* ── Add font form state ──────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  googleName: "",
  category: "SANS_SERIF" as FontCategory,
  subsets: ["latin"] as string[],
};

/* ── Toggle switch ────────────────────────────────────────────────────── */
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

/* ── Category badge ───────────────────────────────────────────────────── */
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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setSubmitting(true);

    const res = await fetch("/api/admin/fonts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(data.error ?? "Something went wrong.");
      return;
    }

    setFonts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(EMPTY_FORM);
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

  /* ── Render ── */
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
          <h2 className="text-base font-semibold text-ink mb-5">Add Google Font</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="f-name">
                Display name <span className="text-red-500">*</span>
              </label>
              <input
                id="f-name"
                type="text"
                required
                placeholder="e.g. Playfair Display"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              />
            </div>

            {/* Google name */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="f-google">
                Google Fonts name
                <span className="ml-1.5 text-xs text-ink-muted font-normal">(if different from display name)</span>
              </label>
              <input
                id="f-google"
                type="text"
                placeholder="Leave blank to use display name"
                value={form.googleName}
                onChange={(e) => setForm((f) => ({ ...f, googleName: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              />
            </div>

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
              {formError && (
                <p className="text-sm text-red-500 flex-1">{formError}</p>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(""); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 rounded-md border border-border text-sm text-ink-muted
                             hover:text-ink hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium
                             hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Adding…" : "Add font"}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category filter */}
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

        {/* Status filter */}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide hidden lg:table-cell">Google name</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wide">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
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
                      <div className="flex items-center gap-3">
                        <a
                          href={`/?font=${font.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-ink hover:text-accent transition-colors"
                          title="Preview in public site"
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

                    {/* Google name */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-ink-muted font-sans text-xs">{font.googleName ?? "—"}</span>
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
