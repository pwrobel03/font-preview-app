"use client";

import { useState, useRef, useEffect } from "react";
import type { FontRecord, FontCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface Props {
  fonts: FontRecord[];
  value: FontRecord;
  onChange: (font: FontRecord) => void;
  label?: string;
}

export default function FontSelector({ fonts, value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FontCategory | "ALL">("ALL");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const categories = ["ALL", ...Object.keys(CATEGORY_LABELS)] as (FontCategory | "ALL")[];

  const filtered = fonts.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "ALL" || f.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div ref={ref} className="relative">
      {label && (
        <p className="text-xs font-medium text-ink-muted mb-1">{label}</p>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 w-full min-w-[220px] px-3 py-2 rounded-md
                   border border-border bg-surface-subtle text-sm text-ink
                   hover:border-accent/60 transition-colors"
      >
        <span className="truncate font-medium">{value.name}</span>
        <svg
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border border-border bg-surface shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              type="text"
              placeholder="Search fonts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-2 py-1.5 rounded text-sm bg-surface-subtle border border-border
                         text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
                }`}
              >
                {cat === "ALL" ? "All" : CATEGORY_LABELS[cat as FontCategory]}
              </button>
            ))}
          </div>

          {/* List */}
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-ink-muted">No fonts found</li>
            ) : (
              filtered.map((font) => (
                <li key={font.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(font);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between
                                hover:bg-surface-subtle transition-colors ${
                                  font.slug === value.slug
                                    ? "text-accent font-medium"
                                    : "text-ink"
                                }`}
                  >
                    <span>{font.name}</span>
                    <span className="text-[10px] text-ink-muted">
                      {CATEGORY_LABELS[font.category]}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
