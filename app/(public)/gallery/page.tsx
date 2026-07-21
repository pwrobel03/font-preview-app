"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadFont } from "@/lib/font-loader";
import { CATEGORY_LABELS } from "@/types";
import type { FontRecord, FontCategory } from "@/types";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

const CATEGORY_COLORS: Record<FontCategory, string> = {
  SERIF:       "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  SANS_SERIF:  "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300",
  MONOSPACE:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  DISPLAY:     "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  HANDWRITING: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function GalleryPage() {
  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<FontCategory | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fonts")
      .then((r) => r.json())
      .then((data: FontRecord[]) => {
        setFonts(data);
        setLoading(false);
        // Preload all fonts for the gallery
        data.forEach((f) => {
          loadFont(f);
        });
      });
  }, []);

  const categories = ["ALL", ...Object.keys(CATEGORY_LABELS)] as (FontCategory | "ALL")[];

  const filtered = activeCategory === "ALL"
    ? fonts
    : fonts.filter((f) => f.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Loading fonts…
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface-subtle sticky top-12 z-30">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-5 flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-ink">Font Gallery</h1>
            <p className="text-sm text-ink-muted">{filtered.length} of {fonts.length} fonts</p>
          </div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-ink text-surface"
                    : "bg-surface border border-border text-ink-muted hover:text-ink hover:border-ink/30"
                }`}
              >
                {cat === "ALL" ? "All" : CATEGORY_LABELS[cat as FontCategory]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((font) => (
            <Link
              key={font.slug}
              href={`/?font=${font.slug}`}
              className="group block border border-border rounded-xl p-6 bg-surface
                         hover:border-accent/40 hover:shadow-md transition-all duration-200"
            >
              {/* Font name in its own typeface */}
              <div
                className="text-ink mb-3 leading-tight truncate"
                style={{
                  fontFamily: font.familyCss,
                  fontSize: "28px",
                  fontWeight: 700,
                }}
              >
                {font.name}
              </div>

              {/* Sample sentence */}
              <p
                className="text-ink-muted mb-4 line-clamp-2"
                style={{
                  fontFamily: font.familyCss,
                  fontSize: "13px",
                  lineHeight: 1.65,
                }}
              >
                {SAMPLE}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[font.category]}`}>
                  {CATEGORY_LABELS[font.category]}
                </span>
                <span
                  className="text-xs text-ink-muted opacity-0 group-hover:opacity-100
                             transition-opacity flex items-center gap-1"
                >
                  Preview
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
